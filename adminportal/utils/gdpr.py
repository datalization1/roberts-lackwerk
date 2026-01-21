import json
from django.utils import timezone

from adminportal.models import Customer as PortalCustomer, Invoice as PortalInvoice
from main.models import Customer as MainCustomer, DamageReport, Booking


def export_personal_data(email: str) -> dict:
    normalized = email.strip().lower()
    return {
        "email": normalized,
        "generated_at": timezone.now().isoformat(),
        "portal_customers": list(PortalCustomer.objects.filter(email__iexact=normalized).values()),
        "portal_invoices": list(PortalInvoice.objects.filter(customer__email__iexact=normalized).values()),
        "main_customers": list(MainCustomer.objects.filter(email__iexact=normalized).values()),
        "damage_reports": list(DamageReport.objects.filter(email__iexact=normalized).values()),
        "bookings": list(Booking.objects.filter(customer_email__iexact=normalized).values()),
    }


def anonymize_personal_data(email: str, dry_run: bool = False) -> dict:
    normalized = email.strip().lower()
    stamp = timezone.now().strftime("%Y%m%d%H%M")
    anon_email = f"anonymized-{stamp}@example.invalid"

    customers = MainCustomer.objects.filter(email__iexact=normalized)
    damage_reports = DamageReport.objects.filter(email__iexact=normalized)
    bookings = Booking.objects.filter(customer_email__iexact=normalized)
    portal_customers = PortalCustomer.objects.filter(email__iexact=normalized)

    summary = {
        "main_customers": customers.count(),
        "damage_reports": damage_reports.count(),
        "bookings": bookings.count(),
        "portal_customers": portal_customers.count(),
        "anon_email": anon_email,
    }
    if dry_run:
        return summary

    customers.update(
        first_name="Anonymized",
        last_name="User",
        email=anon_email,
        phone="",
        address="",
        city="",
        postal_code="",
        company="",
        notes="Anonymized",
    )
    damage_reports.update(
        first_name="Anonymized",
        last_name="User",
        email=anon_email,
        phone="",
        address="",
        company_name="",
        insurer_contact="",
        insurer_contact_phone="",
        insurer_contact_email="",
    )
    bookings.update(
        customer_name="Anonymized User",
        customer_email=anon_email,
        customer_phone="",
        customer_address="",
        driver_license_number="",
    )
    portal_customers.update(
        first_name="Anonymized",
        last_name="User",
        email=anon_email,
        phone="",
        address="",
        city="",
        postal_code="",
        company="",
        notes="Anonymized",
    )
    return summary


def delete_personal_data(email: str, dry_run: bool = False) -> dict:
    normalized = email.strip().lower()

    customers = MainCustomer.objects.filter(email__iexact=normalized)
    damage_reports = DamageReport.objects.filter(email__iexact=normalized)
    bookings = Booking.objects.filter(customer_email__iexact=normalized)
    portal_customers = PortalCustomer.objects.filter(email__iexact=normalized)
    portal_invoices = PortalInvoice.objects.filter(customer__email__iexact=normalized)

    summary = {
        "main_customers": customers.count(),
        "damage_reports": damage_reports.count(),
        "bookings": bookings.count(),
        "portal_customers": portal_customers.count(),
        "portal_invoices": portal_invoices.count(),
    }
    if dry_run:
        return summary

    portal_invoices.delete()
    portal_customers.delete()
    damage_reports.delete()
    bookings.delete()
    customers.delete()
    return summary
