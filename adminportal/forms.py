from django import forms

from main.models import DamageReport, Booking
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
    related_report = forms.ModelChoiceField(
        queryset=DamageReport.objects.all(), required=False, label="Schadenmeldung"
    )
    related_booking = forms.ModelChoiceField(
        queryset=Booking.objects.all(), required=False, label="Buchung"
    )


class DamageReportUpdateForm(forms.ModelForm):
    class Meta:
        model = DamageReport
        fields = ["status", "admin_notes"]


class BookingUpdateForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ["status", "admin_notes"]


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
            "notification_recipients",
            "smtp_host",
            "smtp_port",
            "smtp_user",
            "smtp_password",
            "smtp_use_tls",
            "smtp_use_ssl",
        ]
        widgets = {
            "smtp_password": forms.PasswordInput(render_value=True),
            "notification_recipients": forms.Textarea(attrs={"rows": 2, "placeholder": "kommagetrennte E-Mails"}),
        }
