from django.core.management.base import BaseCommand
from django.utils import timezone

from adminportal.models import Customer as PortalCustomer
from main.models import Customer, DamageReport, Booking


class Command(BaseCommand):
    help = "Anonymisiert personenbezogene Daten zu einer E-Mail-Adresse."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="E-Mail-Adresse des Kunden")
        parser.add_argument("--dry-run", action="store_true", help="Nur anzeigen, keine Änderungen")

    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        dry_run = options["dry_run"]
        stamp = timezone.now().strftime("%Y%m%d%H%M")
        anon_email = f"anonymized-{stamp}@example.invalid"

        customers = Customer.objects.filter(email__iexact=email)
        damage_reports = DamageReport.objects.filter(email__iexact=email)
        bookings = Booking.objects.filter(customer_email__iexact=email)
        portal_customers = PortalCustomer.objects.filter(email__iexact=email)

        if dry_run:
            self.stdout.write(f"Would anonymize: customers={customers.count()}, reports={damage_reports.count()}, bookings={bookings.count()}, portal_customers={portal_customers.count()}")
            return

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

        self.stdout.write(self.style.SUCCESS("Anonymisierung abgeschlossen."))
