from django.contrib.auth.models import Group, User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from main.models import Booking, Customer, DamageReport, Invoice, Transporter, Vehicle
from rest_framework.test import APIClient
from api.serializers import InvoiceSerializer
from api.validators import booking_range_conflict_exists


class ApiSmokeTests(TestCase):
    def test_login_allows_group_user(self):
        group, _ = Group.objects.get_or_create(name="manager")
        user = User.objects.create_user(username="manager1", password="pass12345")
        user.groups.add(group)
        response = self.client.post(
            reverse("auth-login"),
            data={"username": "manager1", "password": "pass12345"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("manager", response.json().get("groups", []))

    def test_invoice_number_generated(self):
        customer = Customer.objects.create(
            first_name="Test",
            last_name="Customer",
            email="test@example.com",
            phone="+41 44 123 45 67",
            address="Teststrasse 1",
            city="Zuerich",
            postal_code="8000",
        )
        invoice = Invoice.objects.create(customer=customer)
        self.assertTrue(invoice.invoice_number)
        self.assertIn(str(timezone.localdate().year), invoice.invoice_number)

    def test_invoice_totals_calculated(self):
        customer = Customer.objects.create(
            first_name="Test",
            last_name="Customer",
            email="test2@example.com",
            phone="+41 44 123 45 67",
            address="Teststrasse 2",
            city="Zuerich",
            postal_code="8000",
        )
        serializer = InvoiceSerializer(
            data={
                "customer": customer.id,
                "items": [
                    {"description": "Arbeit", "quantity": 2, "unitPrice": 100, "vatRate": 7.7},
                    {"description": "Material", "quantity": 1, "unitPrice": 50, "vatRate": 7.7},
                ],
                "discount": "10.00",
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        invoice = serializer.save()
        self.assertEqual(float(invoice.subtotal), 250.0)
        self.assertEqual(float(invoice.vat_amount), 19.25)
        self.assertEqual(float(invoice.total_amount), 259.25)

    def test_booking_range_conflict(self):
        transporter = Transporter.objects.create(
            name="Sprinter 1",
            kennzeichen="ZH-12345",
            verfuegbar_ab=timezone.localdate(),
        )
        Booking.objects.create(
            transporter=transporter,
            date=timezone.localdate(),
            time_slot="FULLDAY",
            pickup_date=timezone.localdate(),
            return_date=timezone.localdate() + timezone.timedelta(days=2),
            customer_name="Test Kunde",
            customer_email="kunde@example.com",
            customer_phone="+41 44 123 45 67",
            customer_address="Teststrasse 2",
            driver_license_number="ABC12345",
        )
        conflict = booking_range_conflict_exists(
            transporter=transporter,
            pickup_date=timezone.localdate() + timezone.timedelta(days=1),
            return_date=timezone.localdate() + timezone.timedelta(days=3),
        )
        self.assertTrue(conflict)

    def test_booking_availability_endpoint(self):
        client = APIClient()
        transporter = Transporter.objects.create(
            name="Sprinter 2",
            kennzeichen="ZH-67890",
            verfuegbar_ab=timezone.localdate(),
        )
        Booking.objects.create(
            transporter=transporter,
            date=timezone.localdate(),
            time_slot="FULLDAY",
            pickup_date=timezone.localdate(),
            return_date=timezone.localdate(),
            customer_name="Test Kunde",
            customer_email="kunde2@example.com",
            customer_phone="+41 44 123 45 67",
            customer_address="Teststrasse 3",
            driver_license_number="ABC12345",
        )
        url = reverse("booking-availability")
        response = client.get(
            url,
            {
                "transporter": transporter.id,
                "date": timezone.localdate().isoformat(),
                "time_slot": "MORNING",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json().get("available"))

    def test_customer_search_filter(self):
        client = APIClient()
        group, _ = Group.objects.get_or_create(name="admin")
        user = User.objects.create_user(username="admin1", password="pass12345")
        user.groups.add(group)
        client.force_authenticate(user=user)

        Customer.objects.create(
            first_name="Anna",
            last_name="Muster",
            email="anna@example.com",
            phone="+41 44 111 22 33",
            address="Strasse 1",
            city="Zuerich",
            postal_code="8000",
        )
        Customer.objects.create(
            first_name="Ben",
            last_name="Beispiel",
            email="ben@example.com",
            phone="+41 44 444 55 66",
            address="Strasse 2",
            city="Bern",
            postal_code="3000",
        )
        response = client.get(reverse("customer-list"), {"q": "Anna"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["email"], "anna@example.com")

    def test_vehicle_filters(self):
        client = APIClient()
        Vehicle.objects.create(
            type="small",
            license_plate="ZH-111",
            brand="Mercedes",
            model="Sprinter",
            status="available",
            next_service=timezone.localdate(),
        )
        Vehicle.objects.create(
            type="large",
            license_plate="ZH-222",
            brand="Ford",
            model="Transit",
            status="maintenance",
            next_service=timezone.localdate() + timezone.timedelta(days=10),
        )
        response = client.get(reverse("vehicle-list"), {"status": "available"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["license_plate"], "ZH-111")

    def test_damage_report_status_transition(self):
        client = APIClient()
        group, _ = Group.objects.get_or_create(name="employee")
        user = User.objects.create_user(username="emp1", password="pass12345")
        user.groups.add(group)
        client.force_authenticate(user=user)

        report = DamageReport.objects.create(
            email="kunde@example.com",
            phone="+41 44 123 45 67",
            car_brand="VW",
            car_model="Golf",
            damage_type="Unfallschaden",
            message="Lack und Stossstange stark beschaedigt.",
            accident_date=timezone.localdate(),
            accident_location="Zuerich",
        )
        response = client.post(reverse("damage-report-in_progress", args=[report.id]))
        self.assertEqual(response.status_code, 200)
        report.refresh_from_db()
        self.assertEqual(report.status, "in_progress")

    def test_damage_report_document_upload(self):
        client = APIClient()
        report = DamageReport.objects.create(
            email="kunde@example.com",
            phone="+41 44 123 45 67",
            car_brand="VW",
            car_model="Golf",
            damage_type="Unfallschaden",
            message="Dokumente vorhanden.",
            accident_date=timezone.localdate(),
            accident_location="Zuerich",
        )
        pdf = SimpleUploadedFile("police.pdf", b"%PDF-1.4 test", content_type="application/pdf")
        response = client.post(
            reverse("damage-report-upload-document", args=[report.id]),
            data={"document": pdf},
        )
        self.assertEqual(response.status_code, 201)
        report.refresh_from_db()
        self.assertTrue(report.documents)
