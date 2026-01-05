from decimal import Decimal, InvalidOperation

import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from main.models import Booking

stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentIntentCreateView(APIView):
    """
    Erstellt ein Stripe PaymentIntent für eine Buchung.
    Erwartet POST JSON: { "booking_id": <id> }
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        booking_id = request.data.get("booking_id")
        if not booking_id:
            return Response({"detail": "booking_id ist erforderlich."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response({"detail": "Buchung nicht gefunden."}, status=status.HTTP_404_NOT_FOUND)

        if not booking.total_price:
            return Response({"detail": "Kein Betrag für diese Buchung hinterlegt."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount_chf = Decimal(booking.total_price)
            amount_cents = int(amount_chf * 100)
        except (InvalidOperation, TypeError):
            return Response({"detail": "Ungültiger Betrag."}, status=status.HTTP_400_BAD_REQUEST)

        if amount_cents <= 0:
            return Response({"detail": "Betrag muss größer als 0 sein."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency="chf",
                metadata={"booking_id": str(booking.id)},
                receipt_email=booking.customer_email or None,
            )
        except Exception as e:
            return Response({"detail": f"Stripe-Fehler: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "publishable_key": settings.STRIPE_PUBLIC_KEY,
            },
            status=status.HTTP_200_OK,
        )


class StripeWebhookView(APIView):
    """
    Stripe Webhook: verarbeitet PaymentIntent-Events.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except Exception as e:
            return Response({"detail": f"Webhook Error: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get("type")
        data = event.get("data", {}).get("object", {})
        booking_id = data.get("metadata", {}).get("booking_id")
        payment_intent_id = data.get("id")

        if not booking_id:
            return Response({"detail": "Keine booking_id im PaymentIntent."}, status=status.HTTP_200_OK)

        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response({"detail": "Buchung nicht gefunden."}, status=status.HTTP_200_OK)

        if event_type == "payment_intent.succeeded":
            booking.payment_status = "paid"
            if booking.status == "pending":
                booking.status = "confirmed"
            booking.transaction_id = payment_intent_id or ""
            booking.save(update_fields=["payment_status", "status", "transaction_id", "updated_at"])
        elif event_type == "payment_intent.payment_failed":
            booking.payment_status = "unpaid"
            booking.transaction_id = payment_intent_id or ""
            booking.save(update_fields=["payment_status", "transaction_id", "updated_at"])

        return Response({"status": "ok"}, status=status.HTTP_200_OK)
