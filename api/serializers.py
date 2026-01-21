from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from main.models import (
    Booking,
    Customer,
    DamageReport,
    DamagePhoto,
    Invoice,
    Transporter,
    Vehicle,
)
from .validators import (
    validate_date_not_future,
    validate_driver_license,
    validate_phone,
    validate_pickup_return,
    validate_required_booking_fields,
    validate_booking_conflict,
    validate_booking_range_conflict,
)
from .pricing import calculate_total_price


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
            "city",
            "postal_code",
            "company",
            "notes",
            "source",
            "created_date",
            "customer_since",
        ]
        read_only_fields = ["id", "created_date", "customer_since"]


class DamagePhotoSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = DamagePhoto
        fields = ["id", "image", "file_url", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at", "file_url"]

    def get_file_url(self, obj):
        return getattr(obj, "public_url", None) or obj.file_url or (obj.image.url if obj.image else None)


class DamageReportSerializer(serializers.ModelSerializer):
    photos = DamagePhotoSerializer(many=True, read_only=True)
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        source="customer", queryset=Customer.objects.all(), write_only=True, allow_null=True, required=False
    )

    class Meta:
        model = DamageReport
        fields = [
            "id",
            "customer",
            "customer_id",
            "first_name",
            "last_name",
            "company_name",
            "email",
            "phone",
            "car_brand",
            "car_model",
            "vin",
            "type_certificate_number",
            "registration_document",
            "first_registration",
            "mileage",
            "car_part",
            "damaged_parts",
            "affected_parts",
            "damage_type",
            "accident_date",
            "accident_location",
            "message",
            "address",
            "plate",
            "no_plate",
            "insurer",
            "other_insurer",
            "policy_number",
            "accident_number",
            "insurer_contact",
            "insurer_contact_phone",
            "insurer_contact_email",
            "other_party_involved",
            "police_involved",
            "documents",
            "status",
            "admin_notes",
            "created_at",
            "photos",
        ]
        read_only_fields = ["id", "admin_notes", "created_at", "photos"]

    def validate(self, attrs):
        # Minimal required fields for public submission
        required = ["email", "phone", "car_brand", "car_model", "damage_type", "message"]
        missing = [f for f in required if not attrs.get(f)]
        if missing:
            raise ValidationError(f"Folgende Felder sind erforderlich: {', '.join(missing)}")
        validate_phone(attrs.get("phone"))
        insurer = attrs.get("insurer")
        policy_number = attrs.get("policy_number")
        if insurer and insurer not in ["NO_INSURANCE", ""] and not policy_number:
            raise ValidationError("Policennummer ist erforderlich, wenn eine Versicherung gewählt wird.")
        message = attrs.get("message") or ""
        if len(message.strip()) < 20:
            raise ValidationError("Schadensbeschreibung muss mindestens 20 Zeichen enthalten.")
        accident_date = attrs.get("accident_date")
        accident_location = attrs.get("accident_location")
        if not accident_date:
            raise ValidationError("Unfalldatum ist erforderlich.")
        if not accident_location:
            raise ValidationError("Unfallort ist erforderlich.")
        validate_date_not_future(accident_date, "Unfalldatum")
        return attrs


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            "id",
            "type",
            "license_plate",
            "brand",
            "model",
            "year",
            "mileage",
            "volume",
            "payload",
            "features",
            "daily_rate",
            "vin",
            "insurance_number",
            "next_service",
            "status",
            "photo",
        ]
        read_only_fields = ["id", "photo"]


class TransporterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transporter
        fields = [
            "id",
            "name",
            "kennzeichen",
            "farbe",
            "preis_chf",
            "verfuegbar_ab",
            "description",
            "buchung",
            "image",
        ]
        read_only_fields = ["id", "image"]


class BookingSerializer(serializers.ModelSerializer):
    transporter_detail = TransporterSerializer(source="transporter", read_only=True)
    vehicle_detail = VehicleSerializer(source="vehicle", read_only=True)
    customer_detail = CustomerSerializer(source="customer", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "transporter",
            "transporter_detail",
            "vehicle",
            "vehicle_detail",
            "customer",
            "customer_detail",
            "date",
            "time_slot",
            "pickup_date",
            "return_date",
            "pickup_time",
            "return_time",
            "customer_name",
            "customer_email",
            "customer_phone",
            "customer_address",
            "driver_license_number",
            "additional_insurance",
            "moving_blankets",
            "hand_truck",
            "tie_down_straps",
            "additional_notes",
            "status",
            "admin_notes",
            "payment_method",
            "payment_status",
            "transaction_id",
            "km_package",
            "extras",
            "insurance",
            "total_price",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "admin_notes", "created_at", "updated_at"]

    def validate(self, attrs):
        validate_required_booking_fields(attrs)
        pickup_date = attrs.get("pickup_date")
        return_date = attrs.get("return_date")
        validate_pickup_return(pickup_date, return_date)
        if not pickup_date or not return_date:
            raise ValidationError("Abhol- und Rückgabedatum sind erforderlich.")
        validate_date_not_future(pickup_date, "Abholdatum")
        validate_date_not_future(return_date, "Rückgabedatum")
        validate_phone(attrs.get("customer_phone"))

        if not attrs.get("km_package"):
            raise ValidationError("Kilometerpaket ist erforderlich.")
        if not attrs.get("insurance"):
            raise ValidationError("Versicherungsoption ist erforderlich.")
        extras = attrs.get("extras") or []
        from .pricing import ALLOWED_EXTRA_CODES  # import inside to avoid circular
        invalid = [code for code in extras if code not in ALLOWED_EXTRA_CODES]
        if invalid:
            raise ValidationError(f"Ungültige Extras-Codes: {', '.join(invalid)}")

        validate_driver_license(attrs.get("driver_license_number"))
        validate_booking_conflict(
            transporter=attrs.get("transporter") or getattr(self.instance, "transporter", None),
            booking_date=attrs.get("date") or getattr(self.instance, "date", None),
            time_slot=attrs.get("time_slot") or getattr(self.instance, "time_slot", None),
            instance_id=getattr(self.instance, "id", None),
        )
        validate_booking_range_conflict(
            transporter=attrs.get("transporter") or getattr(self.instance, "transporter", None),
            vehicle=attrs.get("vehicle") or getattr(self.instance, "vehicle", None),
            pickup_date=pickup_date or getattr(self.instance, "pickup_date", None),
            return_date=return_date or getattr(self.instance, "return_date", None),
            instance_id=getattr(self.instance, "id", None),
        )
        return attrs

    def create(self, validated_data):
        total_price = calculate_total_price(
            vehicle_type=validated_data.get("vehicle").type if validated_data.get("vehicle") else None,
            pickup_date=validated_data.get("pickup_date"),
            return_date=validated_data.get("return_date"),
            km_package=validated_data.get("km_package"),
            insurance=validated_data.get("insurance"),
            extras=validated_data.get("extras"),
        )
        validated_data["total_price"] = total_price
        return super().create(validated_data)

    def update(self, instance, validated_data):
        total_price = calculate_total_price(
            vehicle_type=validated_data.get("vehicle", instance.vehicle).type if (validated_data.get("vehicle") or instance.vehicle) else None,
            pickup_date=validated_data.get("pickup_date", instance.pickup_date),
            return_date=validated_data.get("return_date", instance.return_date),
            km_package=validated_data.get("km_package", instance.km_package),
            insurance=validated_data.get("insurance", instance.insurance),
            extras=validated_data.get("extras", instance.extras),
        )
        validated_data["total_price"] = total_price
        return super().update(instance, validated_data)


class InvoiceSerializer(serializers.ModelSerializer):
    customer_detail = CustomerSerializer(source="customer", read_only=True)

    def _to_decimal(self, value, field_name):
        try:
            return Decimal(str(value))
        except Exception as exc:
            raise ValidationError({field_name: "Ungültiger Zahlenwert."}) from exc

    def _normalize_items(self, items):
        normalized = []
        subtotal = Decimal("0.00")
        vat_amount = Decimal("0.00")
        for item in items or []:
            quantity = self._to_decimal(item.get("quantity", 0), "items.quantity")
            unit_price = self._to_decimal(item.get("unitPrice", item.get("unit_price", 0)), "items.unitPrice")
            vat_rate = self._to_decimal(item.get("vatRate", item.get("vat_rate", 0)), "items.vatRate")
            line_total = self._to_decimal(item.get("total", quantity * unit_price), "items.total")

            if quantity < 0 or unit_price < 0 or vat_rate < 0 or line_total < 0:
                raise ValidationError("Rechnungspositionen dürfen keine negativen Werte enthalten.")

            subtotal += line_total
            vat_amount += (line_total * vat_rate / Decimal("100"))

            normalized.append(
                {
                    **item,
                    "quantity": float(quantity),
                    "unitPrice": float(unit_price),
                    "vatRate": float(vat_rate),
                    "total": float(line_total),
                }
            )

        subtotal = subtotal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        vat_amount = vat_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return normalized, subtotal, vat_amount

    def _apply_totals(self, attrs):
        items = attrs.get("items")
        if items is None:
            return attrs
        normalized, subtotal, vat_amount = self._normalize_items(items)
        discount = self._to_decimal(attrs.get("discount") or 0, "discount")
        if discount < 0:
            raise ValidationError({"discount": "Rabatt darf nicht negativ sein."})
        total = (subtotal - discount + vat_amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        attrs["items"] = normalized
        attrs["subtotal"] = subtotal
        attrs["vat_amount"] = vat_amount
        attrs["total_amount"] = total
        return attrs

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "customer",
            "customer_detail",
            "invoice_date",
            "due_date",
            "items",
            "subtotal",
            "discount",
            "vat_amount",
            "total_amount",
            "status",
            "payment_date",
            "payment_method",
            "type",
            "related_id",
            "notes",
            "public_notes",
            "created_at",
            "sent_at",
        ]
        read_only_fields = ["id", "invoice_number", "created_at", "sent_at"]

    def validate(self, attrs):
        attrs = self._apply_totals(attrs)
        return attrs

    def create(self, validated_data):
        validated_data = self._apply_totals(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._apply_totals(validated_data)
        return super().update(instance, validated_data)
