from datetime import timedelta, date, datetime
from decimal import Decimal
from django.utils import timezone
import os
import logging
from uuid import uuid4
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.core.mail import send_mail
from django.utils.dateparse import parse_date
from django.core.files.storage import FileSystemStorage, default_storage
from formtools.wizard.views import SessionWizardView
from django.db.models import Exists, OuterRef
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django import forms
from .models import Transporter, Booking, DamageReport, DamagePhoto, DAMAGE_PART_CODES, Vehicle
from api.validators import validate_booking_conflict
from .forms import (
    BookingForm,
    AvailabilitySearchForm,
    CarDetailsForm,
    PersonalDetailsForm,
    InsuranceDetailsForm,
    AccidentDetailsForm,
    ReviewForm,
)
from adminportal.utils.audit import log_audit
from .utils.emailing import send_templated_mail, resolve_admin_recipients
from .utils.security import get_client_ip, is_rate_limited, register_failed_attempt, reset_rate_limit
from .utils.pdf import render_booking_invoice_pdf

# Admin Seite
class AdminLoginForm(forms.Form):
    username = forms.CharField(label="Benutzername", max_length=150)
    password = forms.CharField(label="Passwort", widget=forms.PasswordInput)


def is_staff_user(user):
    return user.is_active and user.is_staff

# temporärer Speicher (lokal oder S3-kompatibel)
def get_wizard_storage():
    storage = default_storage
    if isinstance(storage, FileSystemStorage):
        # Lokale Ablage
        wizard_dir = os.path.join(settings.MEDIA_ROOT, "wizard")
        os.makedirs(wizard_dir, exist_ok=True)
        return FileSystemStorage(location=wizard_dir)
    return storage

file_storage = get_wizard_storage()
logger = logging.getLogger("schaden")

# ---------- Statische Seiten ----------

def home(request):
    def _active_names(items):
        names = []
        for item in items or []:
            if isinstance(item, dict):
                name = item.get("name") or item.get("label") or item.get("title")
                if name and item.get("active", True):
                    names.append(name)
            elif isinstance(item, str):
                names.append(item)
        return names

    ctx = {}
    try:
        from adminportal.models import PortalSettings
        portal_settings = PortalSettings.objects.first()
        active_services = _active_names(
            portal_settings.homepage_services if portal_settings else []
        )
        if active_services:
            ctx["use_homepage_services"] = True
            ctx["homepage_service_names"] = active_services
    except Exception:
        pass

    return render(request, "home.html", ctx)


def healthz(request):
    return HttpResponse("ok", content_type="text/plain")

def dienstleistungen(request):
    return render(request, "dienstleistungen.html")

def ueber_uns(request):
    return render(request, "ueber_uns.html")

def impressum(request):
    return render(request, "impressum.html")

def datenschutz(request):
    return render(request, "datenschutz.html")

# ---------- Schaden melden: Wizard ----------

FORMS = [
    ("car",       CarDetailsForm),
    ("personal",  PersonalDetailsForm),
    ("insurance", InsuranceDetailsForm),
    ("accident",  AccidentDetailsForm),
    ("review",    ReviewForm),
]

class ClaimWizard(SessionWizardView):
    form_list = FORMS
    file_storage = file_storage
    template_name = "claim_wizard.html"

    def post(self, request, *args, **kwargs):
        step = request.POST.get("claim_wizard-current_step") or self.steps.current
        logger.debug("🟢 POST step=%s Content-Type=%s", step, request.META.get("CONTENT_TYPE"))
        try:
            logger.debug("POST keys: %s", list(request.POST.keys()))
            logger.debug("FILES keys: %s", list(request.FILES.keys()))
            for k, f in request.FILES.items():
                logger.debug("  FILE[%s]: name=%s size=%s type=%s", k, getattr(f, "name", None), getattr(f, "size", None), getattr(f, "content_type", None))
            for k in request.FILES.keys():
                fl = request.FILES.getlist(k)
                if len(fl) > 1:
                    logger.debug("  getlist(%s) -> %d files", k, len(fl))
        except Exception as e:
            logger.exception("POST logging error: %s", e)
        return super().post(request, *args, **kwargs)

    def get_context_data(self, form=None, **kwargs):
        ctx = super().get_context_data(form=form, **kwargs)
        titles = {
            "car": "Car Details",
            "personal": "Personal Details",
            "insurance": "Insurance Details",
            "accident": "Accident Details",
            "review": "Review & Submit",
        }
        ctx["step_titles"] = titles
        ctx["current_step_title"] = titles.get(self.steps.current, "")  # ← NEU
        ctx["steps_list"] = [name for name, _ in FORMS]
        car_data = self.get_cleaned_data_for_step("car") or {}
        ctx["car_registration_document"] = car_data.get("registration_document")

        if self.steps.current == "review":
            car = car_data
            personal = self.get_cleaned_data_for_step("personal") or {}
            insurance = self.get_cleaned_data_for_step("insurance") or {}
            accident = self.get_cleaned_data_for_step("accident") or {}
            parts_map = dict(DAMAGE_PART_CODES)
            parts_codes = accident.get("damaged_parts") or []
            parts_labels = [parts_map.get(code, code) for code in parts_codes]
            ctx["summary"] = {
                "car": car,
                "personal": personal,
                "insurance": insurance,
                "accident": accident,
            }
            ctx["damaged_parts_labels"] = parts_labels
            ctx["data"] = {**car, **personal, **insurance, **{k: v for k, v in accident.items() if k != "photos"}}
            ctx["photos"] = accident.get("photos", [])
        return ctx

    def process_step(self, form):
        try:
            fkeys = list(getattr(form, "files", {}).keys())
        except Exception:
            fkeys = []
        logger.debug("process_step: step=%s form.files=%s", self.steps.current, fkeys)
        return super().process_step(form)

    def done(self, form_list, **kwargs):
        car       = self.get_cleaned_data_for_step("car") or {}
        personal  = self.get_cleaned_data_for_step("personal") or {}
        ins       = self.get_cleaned_data_for_step("insurance") or {}
        accident  = self.get_cleaned_data_for_step("accident") or {}

        # Full name splitten
        first_name = personal.get("first_name", "")
        last_name = personal.get("last_name", "")

        report = DamageReport.objects.create(
            first_name   = first_name,
            last_name    = last_name,
            email        = personal.get("email"),
            phone        = personal.get("phone", ""),
            address      = f"{personal.get('address_street','')} {personal.get('postal_code','')} {personal.get('city','')}".strip(),

            car_brand    = car.get("car_brand", ""),
            car_model    = car.get("car_model", ""),
            vin          = car.get("vin", ""),
            type_certificate_number = car.get("type_certificate_number", ""),
            registration_document = car.get("registration_document"),
            plate        = car.get("plate", ""),

            insurer         = ins.get("insurer", ""),
            policy_number   = ins.get("policy_number", ""),
            other_insurer   = ins.get("other_insurer", ""),
            accident_number = ins.get("accident_number", ""),
            insurer_contact = ins.get("insurer_contact", ""),
            insurer_contact_phone = ins.get("insurer_contact_phone", ""),
            insurer_contact_email = ins.get("insurer_contact_email", ""),

            message      = accident.get("message", ""),
            damaged_parts= accident.get("damaged_parts", []),
            accident_date = accident.get("accident_date"),
            accident_location = accident.get("accident_location", ""),
            damage_type = accident.get("damage_type", ""),
            other_party_involved = bool(accident.get("other_party_involved")),
            police_involved = bool(accident.get("police_involved")),
            # car_part lassen wir optional leer (wir haben mehrere parts)
        )

        # Mehrfach-Fotos speichern (lokal oder S3)
        photos = accident.get("photos") or []
        for file_obj in photos:
            photo = DamagePhoto.objects.create(report=report, image=file_obj)
            if photo.image:
                photo.file_url = photo.image.url
                photo.save(update_fields=["file_url"])

        documents = accident.get("documents") or []
        if documents:
            now = timezone.now()
            date_path = now.strftime("%Y/%m/%d")
            stored_urls = []
            for file_obj in documents:
                safe_name = f"{uuid4().hex}_{file_obj.name}"
                storage_path = f"damage_docs/{date_path}/{safe_name}"
                stored_path = default_storage.save(storage_path, file_obj)
                stored_urls.append(default_storage.url(stored_path))
            report.documents = stored_urls
            report.save(update_fields=["documents"])

        # E-Mails via Templates + Settings
        try:
            from adminportal.models import PortalSettings  # lokale Import, um Zirkeln zu vermeiden
            portal_settings = PortalSettings.objects.first()
        except Exception:
            portal_settings = None

        try:
            send_templated_mail(
                subject=f"Bestätigung Ihrer Schadenmeldung #{report.pk}",
                template_path="emails/claim_customer.html",
                context={"report": report},
                recipients=[report.email],
                from_email=settings.CONTACT_EMAIL,
                portal_settings=portal_settings,
            )
            if not portal_settings or portal_settings.notify_new_damage:
                recipients = resolve_admin_recipients(portal_settings, settings.CONTACT_EMAIL)
                send_templated_mail(
                    subject=f"Neue Schadenmeldung #{report.pk}",
                    template_path="emails/claim_admin.html",
                    context={"report": report},
                    recipients=recipients,
                    from_email=settings.CONTACT_EMAIL,
                    portal_settings=portal_settings,
                )
        except Exception:
            pass
        return redirect(reverse("schaden_success", kwargs={"pk": report.pk}))

def schaden_success(request, pk):
    report = get_object_or_404(DamageReport, pk=pk)
    return render(request, "schaden_success.html", {"report": report})

# ---------- Transporter / Mietfahrzeuge ----------
def mietfahrzeuge(request):
    _sync_transporters_from_vehicles()
    transporters = Transporter.objects.all()

    # Step-1-Daten aus Session
    step1_data = request.session.get("rental_step1", {}).copy()

    # Falls leer, aber bereits Booking vorhanden → aus Booking befüllen (wie vorher besprochen)
    if not step1_data:
        current_booking_id = request.session.get("current_booking_id")
        if current_booking_id:
            try:
                booking = Booking.objects.get(pk=current_booking_id)
                step1_data = {
                    "transporter_id": booking.transporter_id,
                    "date": booking.date.isoformat() if booking.date else "",
                    "time_slot": booking.time_slot,
                    "timeblock": None,  # kannst du bei Bedarf aus time_slot zurückmappen
                }
                request.session["rental_step1"] = step1_data
            except Booking.DoesNotExist:
                pass

    if request.method == "POST":
        transporter_id = request.POST.get("transporter_id")
        pickup_date = request.POST.get("pickup_date")
        timeblock = request.POST.get("time_block") or request.POST.get("timeblock")
        return_date = request.POST.get("return_date")

        if pickup_date and timeblock:
            slot_map = {
                "morning": "MORNING",
                "afternoon": "AFTERNOON",
                "fullday": "FULLDAY",
            }
            time_slot_code = slot_map.get(timeblock, "MORNING")

            step1_data = {
                "transporter_id": int(transporter_id) if transporter_id else None,
                "date": pickup_date,
                "time_slot": time_slot_code,
                "timeblock": timeblock,
                "return_date": return_date,
            }
            request.session["rental_step1"] = step1_data

            if transporter_id:
                return redirect("booking_create", transporter_id=transporter_id)

        if not pickup_date or not timeblock:
            context = {
                "transporters": transporters,
                "step1": step1_data,
                "has_filter": False,
                "all_available": False,
                "any_unavailable": False,
                "available_count": transporters.count(),
                "total_count": transporters.count(),
                "form_error": "Bitte Abholdatum und Zeitblock auswählen.",
            }
            return render(request, "mietfahrzeuge.html", context)

    # 🔹 Verfügbarkeit pro Transporter prüfen (nur wenn Datum + Slot gewählt)
    selected_date_str = step1_data.get("date")
    selected_slot_code = step1_data.get("time_slot")  # MORNING/AFTERNOON/FULLDAY
    selected_date = parse_date(selected_date_str) if selected_date_str else None

    total_count = transporters.count()
    available_count = 0
    vehicle_by_plate = {v.license_plate: v for v in Vehicle.objects.all()}

    if selected_date and selected_slot_code:
        for t in transporters:
            booked = Booking.objects.filter(
                transporter=t,
                date=selected_date,
                time_slot=selected_slot_code,
            ).exists()
            vehicle = vehicle_by_plate.get(t.kennzeichen)
            is_inactive = vehicle and vehicle.status != "available"
            t.is_unavailable = booked or bool(is_inactive)

            # Sehr einfache "nächste Verfügbarkeit": nächster Tag
            t.next_available_date = selected_date + timedelta(days=1) if booked else None

            if not t.is_unavailable:
                available_count += 1
    else:
        for t in transporters:
            vehicle = vehicle_by_plate.get(t.kennzeichen)
            t.is_unavailable = bool(vehicle and vehicle.status != "available")
            t.next_available_date = None
            if not t.is_unavailable:
                available_count += 1

    has_filter = bool(selected_date and selected_slot_code)
    all_available = has_filter and available_count == total_count
    any_unavailable = has_filter and available_count < total_count

    context = {
        "transporters": transporters,
        "step1": step1_data,
        "has_filter": has_filter,
        "all_available": all_available,
        "any_unavailable": any_unavailable,
        "available_count": available_count,
        "total_count": total_count,
    }
    return render(request, "mietfahrzeuge.html", context)

def _sync_transporters_from_vehicles():
    for vehicle in Vehicle.objects.all():
        defaults = {
            "name": f"{vehicle.brand} {vehicle.model}".strip() or vehicle.license_plate,
            "preis_chf": vehicle.daily_rate or 0,
            "halbtag_preis_chf": vehicle.half_day_rate or 0,
            "verfuegbar_ab": timezone.localdate(),
        }
        transporter, created = Transporter.objects.get_or_create(
            kennzeichen=vehicle.license_plate,
            defaults=defaults,
        )
        updates = {}
        name = f"{vehicle.brand} {vehicle.model}".strip() or vehicle.license_plate
        if transporter.name != name:
            updates["name"] = name
        if transporter.preis_chf != vehicle.daily_rate:
            updates["preis_chf"] = vehicle.daily_rate or 0
        if transporter.halbtag_preis_chf != vehicle.half_day_rate:
            updates["halbtag_preis_chf"] = vehicle.half_day_rate or 0
        if vehicle.photo and transporter.bild != vehicle.photo:
            updates["bild"] = vehicle.photo
        if updates:
            for key, value in updates.items():
                setattr(transporter, key, value)
            transporter.save(update_fields=list(updates.keys()))

def transporter_list(request):
    # Falls separat verlinkt – identisch zu 'mietfahrzeuge'
    _sync_transporters_from_vehicles()
    transporters = Transporter.objects.all()
    return render(request, "mietfahrzeuge.html", {"transporters": transporters})

def book_transporter(request, transporter_id):
    transporter = get_object_or_404(Transporter, id=transporter_id)

    # 1) Versuch, eine existierende Buchung zu laden (zurück von Schritt 3 etc.)
    booking_instance = None
    current_booking_id = request.session.get("current_booking_id")
    if current_booking_id:
        try:
            booking_instance = Booking.objects.get(pk=current_booking_id)
        except Booking.DoesNotExist:
            booking_instance = None

    # 2) Step-1-Daten aus Session (für den allerersten Durchlauf)
    step1_data = request.session.get("rental_step1", {})
    date_raw = step1_data.get("date")
    step1_date = parse_date(date_raw) if isinstance(date_raw, str) else date_raw
    step1_time_slot = step1_data.get("time_slot")

    if request.method == "POST":
        # Form enthält NUR Kundendaten
        form = BookingForm(request.POST, request.FILES, instance=booking_instance)

        if form.is_valid():
            booking = form.save(commit=False)
            booking.transporter = transporter

            # Datum & Slot:
            if booking_instance is None:
                # erster Durchlauf: aus Schritt 1 setzen
                booking.date = step1_date
                booking.time_slot = step1_time_slot
            else:
                # Zurück von Schritt 3: bestehende Werte beibehalten
                # (booking_instance enthält bereits gültiges date/time_slot)
                booking.date = booking_instance.date
                booking.time_slot = booking_instance.time_slot

            try:
                validate_booking_conflict(
                    transporter=booking.transporter,
                    booking_date=booking.date,
                    time_slot=booking.time_slot,
                    instance_id=booking_instance.id if booking_instance else None,
                )
            except Exception as e:
                form.add_error(None, str(e))
            else:
                booking.save()
                request.session["current_booking_id"] = booking.id
                return redirect("booking_options")
    else:
        # GET → Formular befüllen
        if booking_instance:
            form = BookingForm(instance=booking_instance)
        else:
            form = BookingForm()

    return render(request, "booking_form.html", {"form": form, "transporter": transporter})

def transporter_availability(request, transporter_id):
    transporter = get_object_or_404(Transporter, id=transporter_id)
    today = date.today()
    dates = [today + timedelta(days=i) for i in range(7)]

    availability = []
    for d in dates:
        bookings = Booking.objects.filter(
            transporter=transporter, date=d
        ).values_list("time_slot", flat=True)

        # Default
        morning, afternoon, fullday = "✅ frei", "✅ frei", "✅ frei"

        if "FULLDAY" in bookings:
            morning = afternoon = fullday = "❌ gebucht"
        else:
            if "MORNING" in bookings:
                morning = "❌ gebucht"
                fullday = "❌ nicht verfügbar"
            if "AFTERNOON" in bookings:
                afternoon = "❌ gebucht"
                fullday = "❌ nicht verfügbar"

        availability.append({
            "date": d,
            "morning": morning,
            "afternoon": afternoon,
            "fullday": fullday,
        })

    return render(request, "transporter_availability.html", {
        "transporter": transporter,
        "availability": availability,
    })

def booking_success(request, booking_id):
    booking = get_object_or_404(Booking, pk=booking_id)
    return render(request, "booking_success.html", {"booking": booking})

def available_transporters(request):
    """
    Zeigt alle Transporter, die für (date, time_slot) frei sind.
    Overlap-Regeln:
      - FULLDAY blockiert MORNING/AFTERNOON/FULLDAY
      - MORNING kollidiert mit MORNING oder FULLDAY
      - AFTERNOON kollidiert mit AFTERNOON oder FULLDAY
    """
    _sync_transporters_from_vehicles()
    form = AvailabilitySearchForm(request.GET or None)
    transporters = []
    chosen_date = None
    chosen_slot = None

    if form.is_valid():
        chosen_date = form.cleaned_data["date"]
        chosen_slot = form.cleaned_data["time_slot"]

        # Slots, die am gewählten Datum eine Kollision verursachen
        if chosen_slot == "FULLDAY":
            conflict_slots = ["MORNING", "AFTERNOON", "FULLDAY"]
        elif chosen_slot == "MORNING":
            conflict_slots = ["MORNING", "FULLDAY"]
        else:  # AFTERNOON
            conflict_slots = ["AFTERNOON", "FULLDAY"]

        conflicts = Booking.objects.filter(
            transporter=OuterRef("pk"),
            date=chosen_date,
            time_slot__in=conflict_slots
        )

        # alle ohne Kollision
        transporters = Transporter.objects.annotate(
            has_conflict=Exists(conflicts)
        ).filter(has_conflict=False)

    return render(request, "available_transporters.html", {
        "form": form,
        "transporters": transporters,
        "chosen_date": chosen_date,
        "chosen_slot": chosen_slot,
    })

def booking_options(request):
    booking_id = request.session.get("current_booking_id")
    if not booking_id:
        # Wenn keine aktive Buchung vorhanden ist, zurück zu Schritt 1
        return redirect("mietfahrzeuge")

    booking = get_object_or_404(Booking, pk=booking_id)
    transporter = booking.transporter

    if request.method == "POST":
        # Checkboxen werden NUR dann True, wenn sie im POST vorhanden sind
        booking.additional_insurance = "additional_insurance" in request.POST
        booking.moving_blankets      = "moving_blankets" in request.POST
        booking.hand_truck           = "hand_truck" in request.POST
        booking.tie_down_straps      = "tie_down_straps" in request.POST
        booking.additional_notes     = (request.POST.get("additional_notes") or "").strip()
        booking.save()

        # 🔴 WICHTIG: current_booking_id NICHT löschen – wir brauchen es für Schritt 4, 5 und fürs Zurückgehen
        return redirect("booking_review")   # Schritt 4

    # GET → einfach Booking an Template geben; dort lesen wir die Booleans wieder aus
    context = {
        "booking": booking,
        "transporter": transporter,
    }
    return render(request, "booking_options.html", context)

def booking_review(request):
    booking_id = request.session.get("current_booking_id")
    if not booking_id:
        return redirect("mietfahrzeuge")

    booking = get_object_or_404(Booking, pk=booking_id)

    # ❗ Basispreis direkt aus dem Transporter-Modell
    daily_price = booking.transporter.preis_chf  # DecimalField
    half_day_price = booking.transporter.halbtag_preis_chf or (daily_price / 2 if daily_price else None)
    is_half_day = booking.time_slot in ("MORNING", "AFTERNOON")
    rental_days = 1  # ggf. später über Dauer berechnen
    if is_half_day:
        base_price = half_day_price
    else:
        base_price = daily_price * rental_days if daily_price else None

    extras = []
    if booking.additional_insurance:
        extras.append(("Zusatzversicherung", 25))
    if booking.moving_blankets:
        extras.append(("Umzugsdecken (10 Stk.)", 15))
    if booking.hand_truck:
        extras.append(("Sackkarre / Dolly", 10))
    if booking.tie_down_straps:
        extras.append(("Spannsets (4 Stk.)", 8))

    extras_total = sum(Decimal(str(price)) for _, price in extras) if extras else Decimal("0.00")

    # ❗ Gesamt = Fahrzeug + Extras
    net_total = (base_price or Decimal("0.00")) + extras_total
    vat_rate = Decimal("0.077")
    vat_amount = (net_total * vat_rate / (Decimal("1.0") + vat_rate)).quantize(Decimal("0.01"))
    total_price = net_total.quantize(Decimal("0.01"))

    context = {
        "booking": booking,
        "base_price": base_price,
        "rental_days": rental_days,
        "extras": extras,
        "extras_total": extras_total,
        "net_total": net_total,
        "vat_amount": vat_amount,
        "total_price": total_price,
        "is_half_day": is_half_day,
    }

    if request.method == "POST":
        return redirect("booking_payment")

    return render(request, "booking_review.html", context)

def booking_payment(request):
    booking_id = request.session.get("current_booking_id")
    if not booking_id:
        return redirect("mietfahrzeuge")

    booking = get_object_or_404(Booking, pk=booking_id)

    daily_price = booking.transporter.preis_chf
    half_day_price = booking.transporter.halbtag_preis_chf or (daily_price / 2 if daily_price else None)
    is_half_day = booking.time_slot in ("MORNING", "AFTERNOON")
    if booking.pickup_date and booking.return_date:
        rental_days = (booking.return_date - booking.pickup_date).days + 1
    else:
        rental_days = 1
    if is_half_day:
        base_price = half_day_price
        rental_days = 1
    else:
        base_price = daily_price * rental_days if daily_price else None

    extras_total = Decimal("0.00")
    if booking.additional_insurance:
        extras_total += Decimal("25")
    if booking.moving_blankets:
        extras_total += Decimal("15")
    if booking.hand_truck:
        extras_total += Decimal("10")
    if booking.tie_down_straps:
        extras_total += Decimal("8")

    net_total = (base_price or Decimal("0.00")) + extras_total
    vat_rate = Decimal("0.077")
    vat_amount = (net_total * vat_rate / (Decimal("1.0") + vat_rate)).quantize(Decimal("0.01"))
    total_price = net_total.quantize(Decimal("0.01"))

    if request.method == "POST":
        booking.payment_method = "CASH"
        booking.payment_status = "unpaid"
        booking.total_price = total_price
        booking.save()

        try:
            from adminportal.models import PortalSettings
            portal_settings = PortalSettings.objects.first()
        except Exception:
            portal_settings = None

        try:
            send_templated_mail(
                subject=f"Buchungsbestätigung BU-{booking.id}",
                template_path="emails/booking_customer.html",
                context={"booking": booking},
                recipients=[booking.customer_email],
                from_email=settings.CONTACT_EMAIL,
                portal_settings=portal_settings,
                attachments=[
                    (
                        f"rechnung-bu-{booking.id}.pdf",
                        render_booking_invoice_pdf(
                            booking,
                            rental_days=rental_days,
                            base_price=base_price,
                            extras_total=extras_total,
                            vat_amount=vat_amount,
                            total_price=total_price,
                        ),
                        "application/pdf",
                    )
                ],
            )
            if not portal_settings or portal_settings.notify_new_booking:
                recipients = resolve_admin_recipients(portal_settings, settings.CONTACT_EMAIL)
                send_templated_mail(
                    subject=f"Neue Buchung BU-{booking.id}",
                    template_path="emails/booking_admin.html",
                    context={"booking": booking},
                    recipients=recipients,
                    from_email=settings.CONTACT_EMAIL,
                    portal_settings=portal_settings,
                )
            if booking.payment_status == "paid" and (not portal_settings or portal_settings.notify_payment_received):
                recipients = resolve_admin_recipients(portal_settings, settings.CONTACT_EMAIL)
                send_templated_mail(
                    subject=f"Zahlung eingegangen BU-{booking.id}",
                    template_path="emails/payment_admin.html",
                    context={"booking": booking},
                    recipients=recipients,
                    from_email=settings.CONTACT_EMAIL,
                    portal_settings=portal_settings,
                )
        except Exception:
            pass

        if "current_booking_id" in request.session:
            del request.session["current_booking_id"]

        return redirect("booking_success", booking_id=booking.id)

    context = {
        "booking": booking,
        "total_price": total_price,
    }
    return render(request, "booking_payment.html", context)

def admin_login_view(request):
    # Wenn schon eingeloggt und Admin, direkt ins Dashboard
    if request.user.is_authenticated and request.user.is_staff:
        return redirect("admin_dashboard")

    error_message = None

    if request.method == "POST":
        form = AdminLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            ip = get_client_ip(request)
            rate_key = f"admin_login:{ip}:{username}"
            if is_rate_limited(rate_key):
                error_message = "Zu viele Versuche. Bitte später erneut versuchen."
                log_audit("admin_login_rate_limited", request=request, metadata={"username": username})
                return render(request, "admin/admin_login.html", {"form": form, "error_message": error_message})
            user = authenticate(request, username=username, password=password)
            if user is not None and user.is_staff:
                reset_rate_limit(rate_key)
                login(request, user)
                log_audit("admin_login_success", request=request, actor=user)
                next_url = request.GET.get("next") or reverse("admin_dashboard")
                return redirect(next_url)
            else:
                register_failed_attempt(rate_key)
                log_audit("admin_login_failed", request=request, metadata={"username": username})
                error_message = "Ungültige Zugangsdaten oder keine Admin-Berechtigung."
    else:
        form = AdminLoginForm()

    context = {
        "form": form,
        "error_message": error_message,
    }
    return render(request, "admin/admin_login.html", context)


@login_required
def admin_logout_view(request):
    log_audit("admin_logout", request=request, actor=request.user)
    logout(request)
    return redirect("admin_login")


@login_required
@user_passes_test(is_staff_user)
def admin_dashboard_view(request):
    return redirect("portal_dashboard")
