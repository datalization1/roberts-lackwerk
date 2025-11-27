from datetime import timedelta, date
import os
import logging
from django.conf import settings
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.core.mail import send_mail
from django.core.files.storage import FileSystemStorage
from formtools.wizard.views import SessionWizardView
from django.db.models import Exists, OuterRef
from .models import Transporter, Booking, DamageReport, DamagePhoto
from .forms import (
    BookingForm,
    AvailabilitySearchForm,
    # Figma-Flow (5 Schritte)
    CarDetailsForm,
    PersonalDetailsForm,
    InsuranceDetailsForm,
    AccidentDetailsForm,
    ReviewForm,
)

# temporärer Speicher (anlegen oder Pfad anpassen)
file_storage = FileSystemStorage(
    location=os.path.join(settings.MEDIA_ROOT, "wizard")
)
os.makedirs(os.path.join(settings.MEDIA_ROOT, "wizard"), exist_ok=True)
logger = logging.getLogger("schaden")

# ---------- Statische Seiten ----------

def home(request):
    return render(request, "home.html")

def dienstleistungen(request):
    return render(request, "dienstleistungen.html")

def ueber_uns(request):
    return render(request, "ueber_uns.html")


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

        if self.steps.current == "review":
            ctx["data"] = {
                **(self.get_cleaned_data_for_step("car") or {}),
                **(self.get_cleaned_data_for_step("personal") or {}),
                **(self.get_cleaned_data_for_step("insurance") or {}),
                **({k: v for k, v in (self.get_cleaned_data_for_step("accident") or {}).items() if k != "photos"}),
            }
            acc = self.get_cleaned_data_for_step("accident") or {}
            ctx["photos"] = acc.get("photos", [])
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
        first_name, last_name = "", ""
        if personal.get("full_name"):
            parts = personal["full_name"].strip().split(" ", 1)
            first_name = parts[0]
            last_name  = parts[1] if len(parts) > 1 else ""

        report = DamageReport.objects.create(
            first_name   = first_name,
            last_name    = last_name,
            email        = personal.get("email"),
            phone        = personal.get("phone", ""),
            address      = personal.get("address", ""),

            car_brand    = car.get("car_brand", ""),
            car_model    = car.get("car_model", ""),
            vin          = car.get("vin", ""),
            plate        = car.get("plate", ""),

            insurer         = ins.get("insurer", ""),
            policy_number   = ins.get("policy_number", ""),
            accident_number = ins.get("accident_number", ""),
            insurer_contact = ins.get("insurer_contact", ""),

            message      = accident.get("message", ""),
            damaged_parts= accident.get("damaged_parts", []),
            # car_part lassen wir optional leer (wir haben mehrere parts)
        )

        # Fotos speichern
        # Fotos speichern (ein einzelnes Bild)
        photo = accident.get("photos")
        if photo:
            DamagePhoto.objects.create(report=report, image=photo)

        # E-Mails (plain text; HTML-templates gerne später)
        try:
            # Kunde
            send_mail(
                subject=f"Bestätigung Ihrer Schadenmeldung #{report.pk}",
                message=(
                    f"Hallo {report.first_name or ''} {report.last_name or ''}\n"
                    f"Firma: {report.company_name or '-'}\n\n"
                    f"Wir haben Ihre Schadenmeldung erhalten und melden uns zeitnah."
                ),
                from_email="noreply@roberts-lackwerk.ch",
                recipient_list=[report.email],
                fail_silently=True,
            )
            # Robert's Lackwerk
            send_mail(
                subject=f"Neue Schadenmeldung #{report.pk}",
                message=(
                    f"Name: {report.first_name or ''} {report.last_name or ''}\n"
                    f"Firma: {report.company_name or '-'}\n"
                    f"E-Mail: {report.email}\n"
                    f"Telefon: {report.phone or '-'}\n"
                    f"Kontrollschild: {'Nicht bekannt' if report.no_plate else (report.plate or '-')}\n"
                    f"Versicherung: {report.insurer or report.other_insurer or '-'}\n"
                    f"Policen-Nr.: {report.policy_number or '-'}\n"
                    f"Teil: {report.car_part}\n"
                    f"Beschreibung: {report.message or '-'}\n"
                ),
                from_email="noreply@roberts-lackwerk.ch",
                recipient_list=["info@roberts-lackwerk.ch"],
                fail_silently=True,
            )
        except Exception:
            pass
        return redirect(reverse("schaden_success", kwargs={"pk": report.pk}))


def schaden_success(request, pk):
    report = get_object_or_404(DamageReport, pk=pk)
    return render(request, "schaden_success.html", {"report": report})

# ---------- Transporter / Mietfahrzeuge ----------

def mietfahrzeuge(request):
    transporters = Transporter.objects.all()
    return render(request, "mietfahrzeuge.html", {"transporters": transporters})

def transporter_list(request):
    # Falls separat verlinkt – identisch zu 'mietfahrzeuge'
    transporters = Transporter.objects.all()
    return render(request, "mietfahrzeuge.html", {"transporters": transporters})

def book_transporter(request, transporter_id):
    transporter = get_object_or_404(Transporter, pk=transporter_id)

    if request.method == "POST":
        form = BookingForm(request.POST)
        if form.is_valid():
            booking = form.save()
            return redirect("booking_success", booking_id=booking.id)
    else:
        form = BookingForm(initial={"transporter": transporter})

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

class ClaimWizard(SessionWizardView):
    form_list = FORMS
    file_storage = file_storage
    template_name = "claim_wizard.html"

    # dein post() usw. bleibt wie bisher ...

    def get_context_data(self, form=None, **kwargs):
        ctx = super().get_context_data(form=form, **kwargs)

        # Titel pro Schritt (falls du das schon hast, kannst du diesen Block anpassen/übernehmen)
        step_titles = {
            "car": "Fahrzeugdaten",
            "personal": "Personendaten",
            "insurance": "Versicherungsdaten",
            "accident": "Schadendetails & Fotos",
            "review": "Zusammenfassung",
        }
        ctx["current_step_title"] = step_titles.get(self.steps.current, "")

        # Zusätzliche Daten für Schritt 5
        if self.steps.current == "review":
            car = self.get_cleaned_data_for_step("car") or {}
            personal = self.get_cleaned_data_for_step("personal") or {}
            insurance = self.get_cleaned_data_for_step("insurance") or {}
            accident = self.get_cleaned_data_for_step("accident") or {}

            ctx["summary"] = {
                "car": car,
                "personal": personal,
                "insurance": insurance,
                "accident": accident,
            }
            ctx["uploaded_photo"] = accident.get("photos")

        return ctx

    def done(self, form_list, **kwargs):
        """
        Wird aufgerufen, wenn alle Schritte erfolgreich durchlaufen wurden.
        Hier speichern wir den Schaden in der Datenbank und leiten zur Success-Seite weiter.
        """
        car       = self.get_cleaned_data_for_step("car") or {}
        personal  = self.get_cleaned_data_for_step("personal") or {}
        insurance = self.get_cleaned_data_for_step("insurance") or {}
        accident  = self.get_cleaned_data_for_step("accident") or {}

        # Vollständiger Name aus full_name aufteilen
        first_name = ""
        last_name  = ""
        full_name = personal.get("full_name", "")
        if full_name:
            parts = full_name.strip().split(" ", 1)
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[1]

        # DamageReport anlegen – Felder ggf. an dein Model anpassen
        report = DamageReport.objects.create(
            first_name   = first_name,
            last_name    = last_name,
            email        = personal.get("email", ""),
            phone        = personal.get("phone", ""),
            address      = personal.get("address", ""),

            car_brand    = car.get("car_brand", ""),
            car_model    = car.get("car_model", ""),
            vin          = car.get("vin", ""),
            plate        = car.get("plate", ""),

            insurer         = insurance.get("insurer", ""),
            policy_number   = insurance.get("policy_number", ""),
            accident_number = insurance.get("accident_number", ""),
            insurer_contact = insurance.get("insurer_contact", ""),

            message       = accident.get("message", ""),
            damaged_parts = accident.get("damaged_parts", []),
        )

        # EIN Foto speichern (wir haben das Formular ja auf ein Bild reduziert)
        photo = accident.get("photos")
        if photo:
            DamagePhoto.objects.create(report=report, image=photo)

        # Redirect auf Erfolgseite – du hattest früher schon eine 'schaden_success'-View
        return redirect(reverse("schaden_success", kwargs={"pk": report.pk}))