from django import forms

from main.models import DamageReport, Booking, Vehicle
from .models import Customer, Invoice, PortalSettings


class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = [
            "first_name",
            "last_name",
            "company",
            "email",
            "phone",
            "address",
            "city",
            "postal_code",
            "source",
            "notes",
        ]
        labels = {
            "first_name": "Vorname",
            "last_name": "Nachname",
            "company": "Firma",
            "email": "E-Mail",
            "phone": "Telefon",
            "address": "Strasse & Hausnummer",
            "city": "Ort",
            "postal_code": "PLZ",
            "source": "Quelle",
            "notes": "Notizen",
        }


class InvoiceForm(forms.ModelForm):
    invoice_number = forms.CharField(required=False)

    class Meta:
        model = Invoice
        fields = [
            "invoice_number",
            "customer",
            "related_report",
            "related_booking",
            "description",
            "amount_chf",
            "status",
            "issue_date",
            "due_date",
        ]
        labels = {
            "invoice_number": "Rechnungsnummer",
            "customer": "Kunde",
            "description": "Beschreibung",
            "amount_chf": "Betrag (CHF)",
            "status": "Status",
            "issue_date": "Rechnungsdatum",
            "due_date": "Fällig am",
        }
    related_report = forms.ModelChoiceField(
        queryset=DamageReport.objects.all(), required=False, label="Schadenmeldung"
    )
    related_booking = forms.ModelChoiceField(
        queryset=Booking.objects.all(), required=False, label="Buchung"
    )


class VehicleForm(forms.ModelForm):
    class Meta:
        model = Vehicle
        fields = [
            "brand",
            "model",
            "type",
            "license_plate",
            "daily_rate",
            "half_day_rate",
            "status",
            "photo",
        ]
        labels = {
            "brand": "Fahrzeugname",
            "model": "Modell",
            "type": "Typ",
            "license_plate": "Kennzeichen",
            "daily_rate": "Tagespreis (CHF)",
            "half_day_rate": "Halbtagespreis (CHF)",
            "status": "Status",
            "photo": "Fahrzeugbild",
        }


class DamageReportUpdateForm(forms.ModelForm):
    class Meta:
        model = DamageReport
        fields = [
            "status",
            "priority",
            "estimated_cost_chf",
            "repair_start",
            "repair_end",
            "assigned_mechanic",
            "admin_notes",
        ]


class BookingUpdateForm(forms.ModelForm):
    DEFAULT_EXTRA_CHOICES = [
        ("moving_blankets", "Möbeldecken (CHF 15)"),
        ("hand_truck", "Sackkarre (CHF 10)"),
        ("tie_down_straps", "Zurrgurte (CHF 8)"),
        ("navigation", "Navigationsgerät (CHF 12)"),
        ("additional_driver", "Zusatzfahrer (CHF 20)"),
        ("winter_tires", "Winterreifen (CHF 25)"),
    ]
    extras = forms.MultipleChoiceField(
        choices=DEFAULT_EXTRA_CHOICES,
        required=False,
        widget=forms.CheckboxSelectMultiple,
        label="Extras",
    )

    class Meta:
        model = Booking
        fields = [
            "status",
            "transporter",
            "date",
            "time_slot",
            "pickup_date",
            "pickup_time",
            "return_date",
            "return_time",
            "km_package",
            "insurance",
            "payment_status",
            "payment_method",
            "transaction_id",
            "total_price",
            "additional_notes",
            "admin_notes",
        ]

    def __init__(self, *args, extras_choices=None, **kwargs):
        super().__init__(*args, **kwargs)
        if extras_choices is not None:
            self.fields["extras"].choices = extras_choices
        if self.instance and self.instance.pk:
            self.fields["extras"].initial = list(self.instance.extras or [])

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.extras = self.cleaned_data.get("extras", [])
        if commit:
            instance.save()
        return instance


class PortalSettingsForm(forms.ModelForm):
    class Meta:
        model = PortalSettings
        fields = [
            "contact_email",
            "branding_text",
            "default_daily_price",
            "default_currency",
            "notify_new_damage",
            "notify_new_booking",
            "notify_payment_received",
            "notification_recipients",
            "smtp_host",
            "smtp_port",
            "smtp_user",
            "smtp_password",
            "smtp_use_tls",
            "smtp_use_ssl",
            "damage_parts",
            "damage_types",
            "insurers",
            "homepage_services",
            "rental_extras",
        ]
        widgets = {
            "smtp_password": forms.PasswordInput(render_value=True),
            "notification_recipients": forms.Textarea(attrs={"rows": 2, "placeholder": "kommagetrennte E-Mails"}),
            "damage_parts": forms.HiddenInput(),
            "damage_types": forms.HiddenInput(),
            "insurers": forms.HiddenInput(),
            "homepage_services": forms.HiddenInput(),
            "rental_extras": forms.HiddenInput(),
        }
