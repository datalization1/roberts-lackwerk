from datetime import date

from django.db.models import Q
from django.core.exceptions import ValidationError
from main.models import Booking


def validate_pickup_return(pickup_date, return_date):
    if pickup_date and return_date and pickup_date > return_date:
        raise ValidationError("Abholdatum darf nicht nach dem Rückgabedatum liegen.")


def validate_required_booking_fields(data):
    required_fields = ["customer_name", "customer_email", "customer_phone", "customer_address", "driver_license_number"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        raise ValidationError(f"Folgende Felder sind erforderlich: {', '.join(missing)}")


def validate_driver_license(driver_license_number: str):
    if driver_license_number and len(driver_license_number) < 5:
        raise ValidationError("Führerscheinnummer scheint zu kurz.")


def validate_phone(phone: str):
    """
    Einfache Plausibilitätsprüfung: muss mit +41 oder 0 starten und mind. 9 Ziffern enthalten.
    """
    if not phone:
        return
    digits = "".join(ch for ch in phone if ch.isdigit())
    if not (phone.strip().startswith("+41") or phone.strip().startswith("0")):
        raise ValidationError("Telefonnummer muss mit +41 oder 0 beginnen.")
    if len(digits) < 9:
        raise ValidationError("Telefonnummer ist zu kurz.")


def validate_date_not_future(d: date, label: str):
    if d and d > date.today():
        raise ValidationError(f"{label} darf nicht in der Zukunft liegen.")


def booking_slot_conflict_exists(transporter, booking_date, time_slot, instance_id=None):
    """
    Prüft Überschneidungen mit bestehenden Buchungen.
    FULLDAY blockiert alle, MORNING/AFTERNOON blockieren sich gegenseitig und FULLDAY.
    """
    if not (transporter and booking_date and time_slot):
        return False
    if time_slot == "FULLDAY":
        conflict_slots = ["MORNING", "AFTERNOON", "FULLDAY"]
    elif time_slot == "MORNING":
        conflict_slots = ["MORNING", "FULLDAY"]
    else:
        conflict_slots = ["AFTERNOON", "FULLDAY"]

    qs = Booking.objects.filter(transporter=transporter, date=booking_date, time_slot__in=conflict_slots)
    if instance_id:
        qs = qs.exclude(pk=instance_id)
    return qs.exists()


def booking_range_conflict_exists(transporter, pickup_date, return_date, vehicle=None, instance_id=None):
    """
    Prüft Überschneidungen über Datumsbereiche (pickup/return).
    Konflikte werden für Transporter und/oder Vehicle geprüft.
    """
    if not pickup_date or not return_date:
        return False
    if pickup_date > return_date:
        raise ValidationError("Abholdatum darf nicht nach dem Rückgabedatum liegen.")

    overlap_filter = (
        Q(pickup_date__isnull=False, return_date__isnull=False, pickup_date__lte=return_date, return_date__gte=pickup_date)
        | Q(date__range=(pickup_date, return_date))
    )

    def _overlap_exists(qs):
        if instance_id:
            qs = qs.exclude(pk=instance_id)
        return qs.filter(overlap_filter).exists()

    conflict = False
    if transporter:
        conflict = conflict or _overlap_exists(Booking.objects.filter(transporter=transporter))
    if vehicle:
        conflict = conflict or _overlap_exists(Booking.objects.filter(vehicle=vehicle))
    return conflict


def validate_booking_conflict(transporter, booking_date, time_slot, instance_id=None):
    if booking_slot_conflict_exists(transporter, booking_date, time_slot, instance_id=instance_id):
        raise ValidationError("Buchung kollidiert mit bestehender Reservierung.")


def validate_booking_range_conflict(transporter, pickup_date, return_date, vehicle=None, instance_id=None):
    if booking_range_conflict_exists(transporter, pickup_date, return_date, vehicle=vehicle, instance_id=instance_id):
        raise ValidationError("Buchung kollidiert mit bestehender Reservierung.")
