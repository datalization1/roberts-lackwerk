import io
import csv
import calendar
import json
from datetime import date
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils import timezone
from django.db.models import Q, Count, Avg, Sum, DecimalField, Value
from django.db.models.functions import Coalesce
from datetime import timedelta
from django.http import HttpResponse, JsonResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

from main.models import DamageReport, Booking, Transporter, Vehicle
from .models import Customer, Invoice, PortalSettings
from .forms import (
    CustomerForm,
    InvoiceForm,
    DamageReportUpdateForm,
    BookingUpdateForm,
    PortalSettingsForm,
    VehicleForm,
)
from main.utils.emailing import resolve_admin_recipients, send_templated_mail
from adminportal.utils.audit import log_audit
from adminportal.utils.gdpr import export_personal_data, anonymize_personal_data, delete_personal_data


def _is_staff(user):
    if not user.is_authenticated:
        return False
    if user.is_staff:
        return True
    return user.groups.filter(name__in=["admin", "manager", "employee"]).exists()


def _has_role(user, roles):
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.groups.filter(name__in=roles).exists()


def _base_context(active_tab: str):
    today = timezone.localdate()
    month_start = today.replace(day=1)
    seven_days_ago = today - timedelta(days=7)
    portal_settings = PortalSettings.objects.first()

    ctx = {
        "active_tab": active_tab,
        "portal_settings": portal_settings,
        "kpi": {
            "reports_total": DamageReport.objects.count(),
            "reports_recent": DamageReport.objects.filter(created_at__gte=seven_days_ago).count(),
            "bookings_total": Booking.objects.count(),
            "bookings_today": Booking.objects.filter(date=today).count(),
            "bookings_upcoming": Booking.objects.filter(date__gte=today).count(),
            "transporters_total": Transporter.objects.count(),
        },
    }
    if active_tab == "dashboard":
        ctx["kpi"]["reports_pending"] = DamageReport.objects.filter(status="pending").count()
        ctx["kpi"]["reports_in_progress"] = DamageReport.objects.filter(status="in_progress").count()
        ctx["kpi"]["reports_completed"] = DamageReport.objects.filter(
            status="completed", created_at__date__gte=month_start
        ).count()
        ctx["kpi"]["bookings_pending"] = Booking.objects.filter(status="pending").count()
    return ctx


@login_required
@user_passes_test(_is_staff)
def dashboard(request):
    ctx = _base_context("dashboard")
    ctx.update(
        {
            "recent_reports": DamageReport.objects.order_by("-created_at")[:3],
            "upcoming_bookings": Booking.objects.select_related("transporter")
            .filter(date__gte=timezone.localdate())
            .order_by("date", "time_slot")[:3],
            "transporters": Transporter.objects.all().order_by("name"),
        }
    )
    return render(request, "adminportal/dashboard.html", ctx)


@login_required
@user_passes_test(_is_staff)
def damage_reports(request):
    ctx = _base_context("damage_reports")
    qs = DamageReport.objects.all().prefetch_related("photos")
    q = request.GET.get("q")
    status = request.GET.get("status")
    insurer = request.GET.get("insurer")
    damage_type = request.GET.get("damage_type")
    date_from = request.GET.get("from")
    date_to = request.GET.get("to")

    if q:
        qs = qs.filter(
            Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(company_name__icontains=q)
            | Q(plate__icontains=q)
            | Q(car_brand__icontains=q)
            | Q(car_model__icontains=q)
            | Q(insurer__icontains=q)
            | Q(damage_type__icontains=q)
        )
    if status:
        qs = qs.filter(status=status)
    if insurer:
        qs = qs.filter(insurer=insurer)
    if damage_type:
        qs = qs.filter(damage_type=damage_type)
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    ctx["filter"] = {
        "q": q or "",
        "status": status or "",
        "insurer": insurer or "",
        "damage_type": damage_type or "",
        "from": date_from or "",
        "to": date_to or "",
    }
    ctx["reports"] = qs.order_by("-created_at")[:200]
    return render(request, "adminportal/damage_reports.html", ctx)


@login_required
@user_passes_test(_is_staff)
def bookings(request):
    ctx = _base_context("bookings")
    qs = Booking.objects.select_related("transporter")
    q = request.GET.get("q")
    status = request.GET.get("status")
    transporter_id = request.GET.get("transporter")
    date_from = request.GET.get("from")
    date_to = request.GET.get("to")
    month = request.GET.get("month")
    year = request.GET.get("year")

    if q:
        qs = qs.filter(
            Q(customer_name__icontains=q)
            | Q(customer_email__icontains=q)
            | Q(transporter__name__icontains=q)
            | Q(transporter__kennzeichen__icontains=q)
        )
    if status:
        qs = qs.filter(status=status)
    if transporter_id:
        qs = qs.filter(transporter_id=transporter_id)
    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)

    ctx["filter"] = {
        "q": q or "",
        "status": status or "",
        "transporter": transporter_id or "",
        "from": date_from or "",
        "to": date_to or "",
    }
    ctx["transporters"] = Transporter.objects.all().order_by("name")
    ctx["bookings"] = qs.order_by("-date", "-id")[:200]

    today = timezone.localdate()
    cal_year = int(year) if year and year.isdigit() else today.year
    cal_month = int(month) if month and month.isdigit() else today.month
    cal_month = max(1, min(12, cal_month))
    month_start = date(cal_year, cal_month, 1)
    month_end = date(cal_year, cal_month, calendar.monthrange(cal_year, cal_month)[1])

    month_bookings = Booking.objects.select_related("transporter").filter(
        date__gte=month_start, date__lte=month_end
    )
    bookings_by_day = {}
    for booking in month_bookings:
        bookings_by_day.setdefault(booking.date.day, []).append(booking)

    cal_weeks = calendar.monthcalendar(cal_year, cal_month)
    prev_month = month_start - timedelta(days=1)
    next_month = month_end + timedelta(days=1)
    ctx["calendar"] = {
        "weeks": cal_weeks,
        "year": cal_year,
        "month": cal_month,
        "label": month_start.strftime("%B %Y"),
        "prev_month": prev_month.month,
        "prev_year": prev_month.year,
        "next_month": next_month.month,
        "next_year": next_month.year,
        "bookings_by_day": bookings_by_day,
    }
    return render(request, "adminportal/bookings.html", ctx)


@login_required
@user_passes_test(_is_staff)
def vehicles(request):
    ctx = _base_context("vehicles")
    ctx["transporters"] = Transporter.objects.all().order_by("name")
    vehicles = Vehicle.objects.all().order_by("brand", "model")
    ctx["vehicles"] = vehicles
    ctx["vehicle_total"] = vehicles.count()
    ctx["vehicle_active"] = vehicles.filter(status="available").count()
    ctx["vehicle_inactive"] = ctx["vehicle_total"] - ctx["vehicle_active"]
    ctx["vehicle_avg_rate"] = vehicles.aggregate(avg_rate=Avg("daily_rate"))["avg_rate"]
    if request.method == "POST":
        form = VehicleForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect(f"{reverse('portal_vehicles')}?created=1")
        ctx["vehicle_form_open"] = True
    else:
        form = VehicleForm()
    ctx["vehicle_created"] = request.GET.get("created") == "1"
    ctx["vehicle_form"] = form
    return render(request, "adminportal/vehicles.html", ctx)


@login_required
@user_passes_test(_is_staff)
def customers(request):
    ctx = _base_context("customers")
    q = request.GET.get("q")
    source = request.GET.get("source")
    sort = request.GET.get("sort")
    base_qs = Customer.objects.all()
    qs = base_qs
    if q:
        qs = qs.filter(
            Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(company__icontains=q)
            | Q(email__icontains=q)
        )
    if source:
        qs = qs.filter(source=source)
    if sort == "name_asc":
        qs = qs.order_by("last_name", "first_name")
    elif sort == "name_desc":
        qs = qs.order_by("-last_name", "-first_name")
    elif sort == "oldest":
        qs = qs.order_by("created_at")
    else:
        qs = qs.order_by("-created_at")
    if request.method == "POST":
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            ctx["customer_created"] = True
            form = CustomerForm()
    else:
        form = CustomerForm()

    form.fields["first_name"].widget.attrs.update({"placeholder": "Max", "class": "fig-customer-input"})
    form.fields["last_name"].widget.attrs.update({"placeholder": "Mustermann", "class": "fig-customer-input"})
    form.fields["company"].widget.attrs.update({"placeholder": "Mustermann GmbH", "class": "fig-customer-input"})
    form.fields["email"].widget.attrs.update({"placeholder": "max@beispiel.ch", "class": "fig-customer-input"})
    form.fields["phone"].widget.attrs.update({"placeholder": "+41 79 123 45 67", "class": "fig-customer-input"})
    form.fields["address"].widget.attrs.update({"placeholder": "Musterstrasse 123", "class": "fig-customer-input"})
    form.fields["postal_code"].widget.attrs.update({"placeholder": "8000", "class": "fig-customer-input"})
    form.fields["city"].widget.attrs.update({"placeholder": "Zürich", "class": "fig-customer-input"})
    form.fields["source"].widget.attrs.update({"class": "fig-customer-input"})
    form.fields["notes"].widget.attrs.update({"placeholder": "Interne Notizen zum Kunden...", "class": "fig-customer-input"})

    ctx["customer_form"] = form
    ctx["customers"] = qs.annotate(
        total_revenue=Coalesce(
            Sum("invoices__amount_chf"),
            Value(0),
            output_field=DecimalField(max_digits=10, decimal_places=2),
        )
    )
    ctx["customer_stats"] = {
        "total": base_qs.count(),
        "damage_reports": base_qs.filter(source="damage-report").count(),
        "rentals": base_qs.filter(source="rental").count(),
        "manual": base_qs.filter(source="manual").count(),
    }
    ctx["today"] = timezone.localdate()
    ctx["filter"] = {"q": q or "", "source": source or "", "sort": sort or ""}
    return render(request, "adminportal/customers.html", ctx)


@login_required
@user_passes_test(_is_staff)
def customer_detail(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    email = customer.email or ""

    reports = DamageReport.objects.filter(email__iexact=email).order_by("-created_at")
    bookings = Booking.objects.select_related("transporter").filter(customer_email__iexact=email).order_by("-date", "-created_at")
    invoices = Invoice.objects.filter(customer=customer).order_by("-created_at")

    total_revenue = sum([inv.amount_chf for inv in invoices]) if invoices else 0
    open_amount = sum([inv.amount_chf for inv in invoices if inv.status in ["pending", "overdue"]]) if invoices else 0

    ctx = _base_context("customers")
    ctx.update(
        {
            "customer": customer,
            "reports": reports[:50],
            "bookings": bookings[:50],
            "invoices": invoices[:50],
            "gdpr_notice": request.GET.get("gdpr"),
            "stats": {
                "reports": reports.count(),
                "bookings": bookings.count(),
                "invoices": invoices.count(),
                "revenue": total_revenue,
                "open_amount": open_amount,
            },
        }
    )
    return render(request, "adminportal/customer_detail.html", ctx)


@login_required
@user_passes_test(_is_staff)
def customer_export(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    payload = export_personal_data(customer.email or "")
    response = HttpResponse(json.dumps(payload, indent=2, default=str), content_type="application/json")
    response["Content-Disposition"] = f'attachment; filename="customer-export-{customer.pk}.json"'
    return response


@login_required
@user_passes_test(_is_staff)
def customer_anonymize(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    if request.method == "POST":
        anonymize_personal_data(customer.email or "")
        return redirect(f"{request.path.rsplit('/', 1)[0]}/?gdpr=anonymized")
    return redirect("portal_customer_detail", pk=pk)


@login_required
@user_passes_test(_is_staff)
def customer_delete(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    if request.method == "POST":
        delete_personal_data(customer.email or "")
        return redirect("portal_customers")
    return redirect("portal_customer_detail", pk=pk)


@login_required
@user_passes_test(_is_staff)
def invoices(request):
    ctx = _base_context("invoices")
    q = request.GET.get("q")
    status = request.GET.get("status")
    kind = request.GET.get("type")
    date_from = request.GET.get("from")
    date_to = request.GET.get("to")
    if request.method == "POST":
        form = InvoiceForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(f"{reverse('portal_invoices')}?created=1")
    else:
        form = InvoiceForm()

    ctx["invoice_form"] = form
    ctx["invoice_created"] = request.GET.get("created") == "1"
    qs = Invoice.objects.select_related("customer").order_by("-created_at")
    if q:
        qs = qs.filter(
            Q(invoice_number__icontains=q)
            | Q(customer__first_name__icontains=q)
            | Q(customer__last_name__icontains=q)
            | Q(customer__company__icontains=q)
            | Q(description__icontains=q)
        )
    if status:
        qs = qs.filter(status=status)
    if kind:
        if kind == "damage-report":
            qs = qs.filter(related_report__isnull=False)
        elif kind == "rental":
            qs = qs.filter(related_booking__isnull=False)
        elif kind == "other":
            qs = qs.filter(related_report__isnull=True, related_booking__isnull=True)
    if date_from:
        qs = qs.filter(issue_date__gte=date_from)
    if date_to:
        qs = qs.filter(issue_date__lte=date_to)

    invoices = list(qs[:200])
    today = timezone.localdate()
    month_start = today.replace(day=1)
    for inv in invoices:
        if inv.status == "pending" and inv.due_date and inv.due_date < today:
            inv.status = "overdue"
            inv.save(update_fields=["status"])
    ctx["invoices"] = invoices
    ctx["filter"] = {
        "q": q or "",
        "status": status or "",
        "type": kind or "",
        "from": date_from or "",
        "to": date_to or "",
    }
    paid_this_month = sum(
        [
            inv.amount_chf
            for inv in invoices
            if inv.status == "paid" and inv.payment_date and inv.payment_date >= month_start
        ]
    )
    paid_total = sum([inv.amount_chf for inv in invoices if inv.status == "paid"])
    open_total = sum([inv.amount_chf for inv in invoices if inv.status in ["pending", "overdue"]])
    overdue_total = sum([inv.amount_chf for inv in invoices if inv.status == "overdue"])
    total_amount = sum([inv.amount_chf for inv in invoices])
    ctx["invoice_stats"] = {
        "total_amount": total_amount,
        "paid_total": paid_total,
        "open_total": open_total,
        "overdue_total": overdue_total,
        "paid_this_month": paid_this_month,
    }
    return render(request, "adminportal/invoices.html", ctx)


@login_required
@user_passes_test(_is_staff)
def invoice_export(request):
    q = request.GET.get("q")
    status = request.GET.get("status")
    kind = request.GET.get("type")
    date_from = request.GET.get("from")
    date_to = request.GET.get("to")
    export_format = (request.GET.get("format") or "csv").lower()

    qs = Invoice.objects.select_related("customer").order_by("-created_at")
    if q:
        qs = qs.filter(
            Q(invoice_number__icontains=q)
            | Q(customer__first_name__icontains=q)
            | Q(customer__last_name__icontains=q)
            | Q(customer__company__icontains=q)
            | Q(description__icontains=q)
        )
    if status:
        qs = qs.filter(status=status)
    if kind:
        if kind == "damage-report":
            qs = qs.filter(related_report__isnull=False)
        elif kind == "rental":
            qs = qs.filter(related_booking__isnull=False)
        elif kind == "other":
            qs = qs.filter(related_report__isnull=True, related_booking__isnull=True)
    if date_from:
        qs = qs.filter(issue_date__gte=date_from)
    if date_to:
        qs = qs.filter(issue_date__lte=date_to)

    invoices = list(qs[:1000])

    if export_format in ["pdf"]:
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="invoices-export.pdf"'
        pdf = canvas.Canvas(response, pagesize=A4)
        width, height = A4
        y = height - 40
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, y, "Rechnungs-Export")
        y -= 20
        pdf.setFont("Helvetica", 9)
        for inv in invoices:
            line = f"{inv.invoice_number} | {inv.customer} | CHF {inv.amount_chf} | {inv.status} | {inv.issue_date}"
            pdf.drawString(40, y, line)
            y -= 14
            if y < 40:
                pdf.showPage()
                y = height - 40
        pdf.showPage()
        pdf.save()
        return response

    response = HttpResponse(content_type="text/csv")
    filename = "invoices-export.csv"
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    writer = csv.writer(response)
    writer.writerow(["Rechnung-Nr.", "Kunde", "Betrag", "Status", "Rechnungsdatum", "Fällig", "Beschreibung"])
    for inv in invoices:
        writer.writerow(
            [
                inv.invoice_number,
                str(inv.customer),
                inv.amount_chf,
                inv.status,
                inv.issue_date,
                inv.due_date,
                inv.description,
            ]
        )
    return response


@login_required
@user_passes_test(lambda u: _has_role(u, ["admin", "manager"]))
def invoice_mark_paid(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    if request.method == "POST":
        today = timezone.localdate()
        invoice.status = "paid"
        invoice.payment_date = today
        invoice.add_event("paid", "Im Portal als bezahlt markiert")
        invoice.save(update_fields=["status", "payment_date", "payment_events", "updated_at"])
        log_audit("invoice_mark_paid", request=request, actor=request.user, metadata={"invoice": invoice.invoice_number})
        portal_settings = PortalSettings.objects.first()
        if not portal_settings or portal_settings.notify_payment_received:
            recipients = resolve_admin_recipients(portal_settings)
            send_templated_mail(
                subject=f"Zahlung eingegangen {invoice.invoice_number}",
                template_path="emails/payment_admin.html",
                context={"invoice": invoice},
                recipients=recipients,
                portal_settings=portal_settings,
            )
    return redirect("portal_invoices")


@login_required
@user_passes_test(lambda u: _has_role(u, ["admin", "manager"]))
def invoice_raise_reminder(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    if request.method == "POST":
        invoice.reminder_level = min((invoice.reminder_level or 0) + 1, 3)
        invoice.status = "overdue"
        invoice.last_reminded_at = timezone.localdate()
        invoice.add_event("reminder", f"Mahnstufe {invoice.reminder_level} gesetzt")
        invoice.save(update_fields=["reminder_level", "status", "last_reminded_at", "payment_events", "updated_at"])
        log_audit("invoice_raise_reminder", request=request, actor=request.user, metadata={"invoice": invoice.invoice_number, "level": invoice.reminder_level})
    return redirect("portal_invoices")


@login_required
@user_passes_test(_is_staff)
def invoice_pdf(request, pk):
    invoice = get_object_or_404(Invoice.objects.select_related("customer"), pk=pk)
    portal_settings = PortalSettings.objects.first()
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 60
    p.setFont("Helvetica-Bold", 18)
    p.drawString(40, y, f"Rechnung {invoice.invoice_number}")
    y -= 25
    p.setFont("Helvetica", 10)
    if portal_settings and portal_settings.branding_text:
        p.drawString(40, y, portal_settings.branding_text[:80])
        y -= 14
    contact = portal_settings.contact_email if portal_settings else ""
    if contact:
        p.drawString(40, y, f"Kontakt: {contact}")
        y -= 14
    p.drawString(40, y, f"Datum: {invoice.issue_date} | Fällig: {invoice.due_date or '-'}")
    y -= 16
    p.drawString(40, y, f"Status: {invoice.get_status_display()} | Mahnstufe: {invoice.reminder_level or 0}")
    if invoice.payment_date:
        y -= 14
        p.drawString(40, y, f"Bezahlt am: {invoice.payment_date}")

    y -= 24
    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, "Kunde")
    p.setFont("Helvetica", 10)
    y -= 16
    p.drawString(40, y, f"{invoice.customer or '-'}")
    y -= 14
    p.drawString(40, y, f"E-Mail: {invoice.customer.email if invoice.customer else ''}")
    y -= 14
    p.drawString(40, y, f"Telefon: {invoice.customer.phone if invoice.customer else ''}")
    y -= 14
    p.drawString(40, y, f"Adresse: {invoice.customer.address if invoice.customer else ''}")

    y -= 24
    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, "Details")
    p.setFont("Helvetica", 10)
    y -= 16
    p.drawString(40, y, f"Betrag: CHF {invoice.amount_chf}")
    y -= 14
    if invoice.related_report_id:
        p.drawString(40, y, f"Schadenmeldung: SM-{invoice.related_report_id}")
        y -= 14
    if invoice.related_booking_id:
        p.drawString(40, y, f"Buchung: BU-{invoice.related_booking_id}")
        y -= 14
    y -= 14
    p.drawString(40, y, f"Beschreibung:")
    y -= 14
    for line in (invoice.description or "-").splitlines() or ["-"]:
        p.drawString(50, y, line[:100])
        y -= 12
        if y < 60:
            p.showPage()
            y = height - 60

    if invoice.payment_events:
        y -= 16
        p.setFont("Helvetica-Bold", 12)
        p.drawString(40, y, "Zahlungshistorie")
        p.setFont("Helvetica", 9)
        y -= 14
        for ev in invoice.payment_events[:6]:
            line = f"{ev.get('ts','')} · {ev.get('kind','')} — {ev.get('note','')}"
            p.drawString(40, y, line[:120])
            y -= 12
            if y < 60:
                p.showPage()
                y = height - 60

    p.showPage()
    p.save()
    pdf = buffer.getvalue()
    buffer.close()

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="invoice-{invoice.invoice_number}.pdf"'
    response.write(pdf)
    return response


@login_required
@user_passes_test(_is_staff)
def schedule(request):
    ctx = _base_context("schedule")
    q = request.GET.get("q")
    transporter_id = request.GET.get("transporter")
    status = request.GET.get("status")
    date_from = request.GET.get("from")
    date_to = request.GET.get("to")

    qs = Booking.objects.select_related("transporter").order_by("date", "time_slot")
    if q:
        qs = qs.filter(Q(customer_name__icontains=q) | Q(transporter__name__icontains=q))
    if transporter_id:
        qs = qs.filter(transporter_id=transporter_id)
    if status:
        qs = qs.filter(status=status)
    if date_from:
        qs = qs.filter(date__gte=date_from)
    if date_to:
        qs = qs.filter(date__lte=date_to)

    grouped = {}
    for booking in qs[:300]:
        grouped.setdefault(booking.date, []).append(booking)

    # Timeline (14 Tage ab Startdatum)
    try:
        start_date = timezone.datetime.fromisoformat(date_from).date() if date_from else timezone.localdate()
    except Exception:
        start_date = timezone.localdate()
    try:
        end_date = timezone.datetime.fromisoformat(date_to).date() if date_to else start_date + timedelta(days=13)
    except Exception:
        end_date = start_date + timedelta(days=13)

    timeline_dates = []
    d = start_date
    while d <= end_date and len(timeline_dates) < 31:
        timeline_dates.append(d)
        d += timedelta(days=1)

    bookings_in_range = qs.filter(date__range=(start_date, end_date)).select_related("transporter")
    booking_map = {(b.transporter_id, b.date): b for b in bookings_in_range}

    timeline_rows = []
    for transporter in Transporter.objects.all().order_by("name"):
        slots = []
        for day in timeline_dates:
            slots.append(booking_map.get((transporter.id, day)))
        timeline_rows.append({"transporter": transporter, "slots": slots})

    ctx["grouped_bookings"] = grouped
    ctx["timeline_dates"] = timeline_dates
    ctx["timeline_rows"] = timeline_rows
    ctx["transporters"] = Transporter.objects.all().order_by("name")
    ctx["filter"] = {
        "q": q or "",
        "status": status or "",
        "transporter": transporter_id or "",
        "from": date_from or "",
        "to": date_to or "",
    }
    return render(request, "adminportal/schedule.html", ctx)


@login_required
@user_passes_test(_is_staff)
def availability(request):
    ctx = _base_context("availability")
    date_str = request.GET.get("date") or ""
    try:
        target_date = timezone.datetime.fromisoformat(date_str).date() if date_str else timezone.localdate()
    except ValueError:
        target_date = timezone.localdate()

    busy = Booking.objects.filter(date=target_date).values_list("transporter_id", flat=True)
    ctx["transporters"] = Transporter.objects.all().order_by("verfuegbar_ab")
    ctx["busy_ids"] = set(busy)
    ctx["target_date"] = target_date
    ctx["upcoming"] = Booking.objects.select_related("transporter").filter(date__gte=target_date).order_by("date")[:20]
    return render(request, "adminportal/availability.html", ctx)


@login_required
@user_passes_test(_is_staff)
def settings_view(request):
    ctx = _base_context("settings")
    settings_obj, _ = PortalSettings.objects.get_or_create(pk=1)
    if request.method == "POST":
        form = PortalSettingsForm(request.POST, instance=settings_obj)
        if form.is_valid():
            form.save()
            ctx["settings_saved"] = True
    else:
        form = PortalSettingsForm(instance=settings_obj)
    ctx["settings_form"] = form
    return render(request, "adminportal/settings.html", ctx)


@login_required
@user_passes_test(_is_staff)
def damage_report_detail(request, pk):
    report = get_object_or_404(DamageReport, pk=pk)
    if request.method == "POST":
        form = DamageReportUpdateForm(request.POST, instance=report)
        if form.is_valid():
            form.save()
            log_audit("damage_report_updated", request=request, actor=request.user, metadata={"report_id": report.pk})
            return redirect("portal_damage_report_detail", pk=pk)
    else:
        form = DamageReportUpdateForm(instance=report)
    ctx = _base_context("damage_reports")
    ctx.update({"report": report, "form": form})
    return render(request, "adminportal/damage_report_detail.html", ctx)


@login_required
@user_passes_test(_is_staff)
def booking_detail(request, pk):
    booking = get_object_or_404(Booking.objects.select_related("transporter"), pk=pk)
    if request.method == "POST":
        form = BookingUpdateForm(request.POST, instance=booking)
        if form.is_valid():
            form.save()
            log_audit("booking_updated", request=request, actor=request.user, metadata={"booking_id": booking.pk})
            return redirect("portal_booking_detail", pk=pk)
    else:
        form = BookingUpdateForm(instance=booking)
    ctx = _base_context("bookings")
    ctx.update({"booking": booking, "form": form})
    return render(request, "adminportal/booking_detail.html", ctx)

# Create your views here.
