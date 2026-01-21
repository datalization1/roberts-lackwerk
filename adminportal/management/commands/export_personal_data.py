import json
from django.core.management.base import BaseCommand

from adminportal.models import Customer as PortalCustomer
from main.models import Customer, DamageReport, Booking


class Command(BaseCommand):
    help = "Exportiert personenbezogene Daten zu einer E-Mail als JSON."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="E-Mail-Adresse des Kunden")

    def handle(self, *args, **options):
        email = options["email"].strip().lower()

        payload = {
            "email": email,
            "main_customers": list(Customer.objects.filter(email__iexact=email).values()),
            "damage_reports": list(DamageReport.objects.filter(email__iexact=email).values()),
            "bookings": list(Booking.objects.filter(customer_email__iexact=email).values()),
            "portal_customers": list(PortalCustomer.objects.filter(email__iexact=email).values()),
        }

        self.stdout.write(json.dumps(payload, indent=2, default=str))
