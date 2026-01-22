from decimal import Decimal
from django.test import TestCase, Client, override_settings
from django.urls import reverse
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core import mail

from main.models import Transporter, Booking, DamageReport
from api.validators import validate_booking_conflict
from main.utils.emailing import send_templated_mail
from main.utils.pdf import render_booking_invoice_pdf
from adminportal.models import PortalSettings, Invoice as PortalInvoice, Customer as PortalCustomer


class MietfahrzeugeViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.transporter = Transporter.objects.create(
            name="Test Van",
            kennzeichen="ZH-12345",
            verfuegbar_ab=timezone.localdate(),
            preis_chf=100,
        )

    def test_missing_fields_shows_error(self):
        resp = self.client.post(reverse("mietfahrzeuge"), {})
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Bitte Abholdatum und Zeitblock auswählen.")

    def test_valid_post_sets_session_and_redirects(self):
        today = timezone.localdate().isoformat()
        resp = self.client.post(
            reverse("mietfahrzeuge"),
            {
                "transporter_id": self.transporter.id,
                "pickup_date": today,
                "time_block": "morning",
            },
        )
        # Erfolgreiches Redirect zum nächsten Schritt
        self.assertEqual(resp.status_code, 302)
        self.assertIn(reverse("booking_create", args=[self.transporter.id]), resp.url)
        # Session enthält Step-1-Daten
        session = self.client.session
        step1 = session.get("rental_step1")
        self.assertIsNotNone(step1)
        self.assertEqual(step1["transporter_id"], self.transporter.id)
        self.assertEqual(step1["date"], today)
        self.assertEqual(step1["time_slot"], "MORNING")


class BookingConflictTests(TestCase):
    def setUp(self):
        self.transporter = Transporter.objects.create(
            name="Test Van",
            kennzeichen="ZH-99999",
            verfuegbar_ab=timezone.localdate(),
            preis_chf=100,
        )
        self.booking_date = timezone.localdate()
        Booking.objects.create(
            transporter=self.transporter,
            date=self.booking_date,
            time_slot="MORNING",
            customer_name="Max Muster",
            customer_email="max@example.com",
            customer_phone="+410000000",
            customer_address="Strasse 1",
            driver_license_number="ABC123",
        )

    def test_conflict_detection_blocks_overlap(self):
        with self.assertRaises(ValidationError):
            validate_booking_conflict(
                transporter=self.transporter,
                booking_date=self.booking_date,
                time_slot="MORNING",
            )

    def test_no_conflict_other_slot(self):
        try:
            validate_booking_conflict(
                transporter=self.transporter,
                booking_date=self.booking_date,
                time_slot="AFTERNOON",
            )
        except ValidationError:
            self.fail("validate_booking_conflict raised for non-overlapping slot")


class DamageReportEmailTests(TestCase):
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_damage_report_confirmation_email(self):
        report = DamageReport.objects.create(
            first_name="Max",
            last_name="Muster",
            email="max@example.com",
            phone="+41 44 123 45 67",
            car_brand="VW",
            car_model="Golf",
            damage_type="Unfallschaden",
            message="Frontschaden an der Stossstange.",
            accident_date=timezone.localdate(),
            accident_location="Zuerich",
        )
        ok = send_templated_mail(
            subject=f"Bestätigung Ihrer Schadenmeldung #{report.pk}",
            template_path="emails/claim_customer.html",
            context={"report": report},
            recipients=[report.email],
            fail_silently=False,
        )
        self.assertTrue(ok)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Schadenmeldung", mail.outbox[0].subject)


class BookingEmailTests(TestCase):
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_booking_email_attaches_pdf(self):
        transporter = Transporter.objects.create(
            name="Test Van",
            kennzeichen="ZH-77777",
            verfuegbar_ab=timezone.localdate(),
            preis_chf=100,
        )
        booking = Booking.objects.create(
            transporter=transporter,
            date=timezone.localdate(),
            pickup_date=timezone.localdate(),
            return_date=timezone.localdate(),
            customer_name="Max Muster",
            customer_email="max@example.com",
            customer_phone="+41 44 123 45 67",
            customer_address="Strasse 1",
            driver_license_number="ABC123",
        )
        pdf = render_booking_invoice_pdf(
            booking,
            rental_days=1,
            base_price=Decimal("100.00"),
            extras_total=Decimal("0.00"),
            vat_amount=Decimal("7.70"),
            total_price=Decimal("107.70"),
        )
        ok = send_templated_mail(
            subject=f"Buchungsbestätigung BU-{booking.id}",
            template_path="emails/booking_customer.html",
            context={"booking": booking},
            recipients=[booking.customer_email],
            attachments=[(f"rechnung-bu-{booking.id}.pdf", pdf, "application/pdf")],
            fail_silently=False,
        )
        self.assertTrue(ok)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(len(mail.outbox[0].attachments), 1)


class AdminNotificationTests(TestCase):
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_admin_payment_notification_uses_recipients(self):
        portal_settings = PortalSettings.objects.create(
            notify_payment_received=True,
            notification_recipients="admin1@example.com, admin2@example.com",
        )
        customer = PortalCustomer.objects.create(first_name="Test", last_name="Kunde", email="kunde@example.com")
        invoice = PortalInvoice.objects.create(
            invoice_number="RE-2025-0001",
            customer=customer,
            amount_chf=Decimal("100.00"),
            status="paid",
            payment_date=timezone.localdate(),
        )
        ok = send_templated_mail(
            subject=f"Zahlung eingegangen {invoice.invoice_number}",
            template_path="emails/payment_admin.html",
            context={"invoice": invoice},
            recipients=portal_settings.notification_recipients.split(","),
            portal_settings=portal_settings,
            fail_silently=False,
        )
        self.assertTrue(ok)
        self.assertEqual(len(mail.outbox), 1)
