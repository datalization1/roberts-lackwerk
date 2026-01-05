from django import template
from main.models import DamageReport, Booking, Transporter

register = template.Library()


@register.simple_tag
def admin_metrics():
    """Aggregate a few lightweight counts for the admin dashboard."""
    return {
        "reports_total": DamageReport.objects.count(),
        "bookings_total": Booking.objects.count(),
        "transporters_total": Transporter.objects.count(),
    }


@register.simple_tag
def latest_reports(limit=3):
    return DamageReport.objects.order_by("-created_at")[:limit]


@register.simple_tag
def upcoming_bookings(limit=3):
    return Booking.objects.order_by("date")[:limit]
