from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from django.core.exceptions import ValidationError

from main.models import Transporter, Booking
from api.validators import validate_booking_conflict


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
        self.assertContains(resp, "Bitte Abholdatum, Zeitblock und einen Transporter auswählen.")

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
