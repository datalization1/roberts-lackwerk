import io
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils import timezone
from django.db.models import Q, Count
from datetime import timedelta
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

from main.models import DamageReport, Booking, Transporter
from .models import Customer, Invoice, PortalSettings
from .forms import (
    CustomerForm,
    InvoiceForm,
    DamageReportUpdateForm,
    BookingUpdateForm,
    PortalSettingsForm,
)


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
        ctx["kpi"]["reports_completed"] = DamageReport.objects.filter(status="completed").count()
        ctx["kpi"]["bookings_pending"] = Booking.objects.filter(status="pending").count()
    return ctx


@login_required
@user_passes_test(_is_staff)
def dashboard(request):
    ctx = _base_context("dashboard")
    ctx.update(
        {
            "recent_reports": DamageReport.objects.order_by("-created_at")[:5],
            "upcoming_bookings": Booking.objects.select_related("transporter")
            .filter(date__gte=timezone.localdate())
            .order_by("date", "time_slot")[:5],
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
        )
    if status:
        qs = qs.filter(status=status)
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    ctx["filter"] = {"q": q or "", "status": status or "", "from": date_from or "", "to": date_to or ""}
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
    return render(request, "adminportal/bookings.html", ctx)


@login_required
@user_passes_test(_is_staff)
def vehicles(request):
    ctx = _base_context("vehicles")
    ctx["transporters"] = Transporter.objects.all().order_by("name")
    return render(request, "adminportal/vehicles.html", ctx)


@login_required
@user_passes_test(_is_staff)
def customers(request):
    ctx = _base_context("customers")
    q = request.GET.get("q")
    qs = Customer.objects.all()
    if q:
        qs = qs.filter(
            Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(company__icontains=q)
            | Q(email__icontains=q)
        )
    if request.method == "POST":
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            ctx["customer_created"] = True
            form = CustomerForm()
    else:
        form = CustomerForm()

    ctx["customer_form"] = form
    ctx["customers"] = qs.order_by("-created_at")
    ctx["filter"] = {"q": q or ""}
    return render(request, "adminportal/customers.html", ctx)


@login_required
@user_passes_test(_is_staff)
def invoices(request):
    ctx = _base_context("invoices")
    if request.method == "POST":
        form = InvoiceForm(request.POST)
        if form.is_valid():
            form.save()
            ctx["invoice_created"] = True
            form = InvoiceForm()
    else:
        form = InvoiceForm()

    ctx["invoice_form"] = form
    invoices = list(Invoice.objects.select_related("customer").order_by("-created_at")[:200])
    today = timezone.localdate()
    for inv in invoices:
        if inv.status == "pending" and inv.due_date and inv.due_date < today:
            inv.status = "overdue"
            inv.save(update_fields=["status"])
    ctx["invoices"] = invoices
    return render(request, "adminportal/invoices.html", ctx)


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
    return redirect("portal_invoices")


@login_required
@user_passes_test(_is_staff)
def invoice_pdf(request, pk):
    invoice = get_object_or_404(Invoice.objects.select_related("customer"), pk=pk)
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 60
    p.setFont("Helvetica-Bold", 18)
    p.drawString(40, y, f"Rechnung {invoice.invoice_number}")
    y -= 25
    p.setFont("Helvetica", 10)
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

    y -= 24
    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, "Details")
    p.setFont("Helvetica", 10)
    y -= 16
    p.drawString(40, y, f"Betrag: CHF {invoice.amount_chf}")
    y -= 14
    p.drawString(40, y, f"Beschreibung:")
    y -= 14
    for line in (invoice.description or "-").splitlines() or ["-"]:
        p.drawString(50, y, line[:100])
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
            return redirect("portal_booking_detail", pk=pk)
    else:
        form = BookingUpdateForm(instance=booking)
    ctx = _base_context("bookings")
    ctx.update({"booking": booking, "form": form})
    return render(request, "adminportal/booking_detail.html", ctx)

# Create your views here.
