from django.db import models
from django.utils import timezone

from main.models import DamageReport, Booking, DAMAGE_PART_CODES, INSURER_CHOICES, INSURER_OTHER, INSURER_NO


class Customer(models.Model):
    SOURCE_CHOICES = [
        ("damage-report", "Schadenmeldung"),
        ("rental", "Vermietung"),
        ("manual", "Manuell"),
        ("both", "Beides"),
    ]

    first_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=80, blank=True)
    company = models.CharField(max_length=120, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=120, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="manual")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.company:
            return self.company
        return f"{self.first_name} {self.last_name}".strip() or self.email


class Invoice(models.Model):
    STATUS_CHOICES = [
        ("draft", "Entwurf"),
        ("pending", "Offen"),
        ("paid", "Bezahlt"),
        ("overdue", "Überfällig"),
        ("cancelled", "Storniert"),
    ]

    invoice_number = models.CharField(max_length=40, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="invoices")
    related_report = models.ForeignKey(DamageReport, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    related_booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    description = models.TextField(blank=True)
    amount_chf = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    issue_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField(null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=30, blank=True)
    payment_events = models.JSONField(default=list, blank=True)
    reminder_level = models.PositiveSmallIntegerField(default=0)
    last_reminded_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.invoice_number

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self.generate_invoice_number()
        if not self.due_date and self.issue_date:
            self.due_date = self.issue_date + timezone.timedelta(days=30)
        return super().save(*args, **kwargs)

    @classmethod
    def generate_invoice_number(cls):
        today = timezone.localdate()
        year = today.year
        prefix = f"RE-{year}-"
        last = cls.objects.filter(invoice_number__startswith=prefix).order_by("-invoice_number").first()
        if last:
            try:
                last_counter = int(last.invoice_number.split("-")[-1])
            except Exception:
                last_counter = 0
        else:
            last_counter = 0
        return f"{prefix}{last_counter + 1:04d}"

    @property
    def is_overdue(self):
        return self.due_date and self.status in ["pending", "overdue"] and self.due_date < timezone.localdate()

    @property
    def overdue_days(self):
        if not self.is_overdue:
            return 0
        return (timezone.localdate() - self.due_date).days

    def add_event(self, kind, note=""):
        events = list(self.payment_events or [])
        events.append(
            {
                "kind": kind,
                "note": note,
                "ts": timezone.now().isoformat(),
            }
        )
        self.payment_events = events


class PortalSettings(models.Model):
    def _default_damage_parts():
        return [{"name": label, "active": True} for _, label in DAMAGE_PART_CODES]

    def _default_damage_types():
        return [
            {"name": "Unfallschaden", "active": True},
            {"name": "Hagelschaden", "active": True},
            {"name": "Parkschaden", "active": True},
            {"name": "Wildschaden", "active": True},
            {"name": "Vandalismus", "active": True},
            {"name": "Sonstiges", "active": True},
        ]

    def _default_insurers():
        base = [label for value, label in INSURER_CHOICES if value not in [INSURER_OTHER, INSURER_NO]]
        base.extend(["Andere", "Ohne Versicherung melden"])
        return [{"name": label, "active": True} for label in base]

    def _default_homepage_services():
        return [
            {"name": "Karosseriereparatur", "active": True},
            {"name": "Autolackierung", "active": True},
            {"name": "Transporter-Vermietung", "active": True},
            {"name": "Versicherungsabwicklung", "active": True},
        ]

    contact_email = models.EmailField(blank=True, default="")
    branding_text = models.CharField(max_length=200, blank=True, default="Verwaltung von Schadenmeldungen und Buchungen")
    default_daily_price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    default_currency = models.CharField(max_length=8, default="CHF")
    notify_new_damage = models.BooleanField(default=True)
    notify_new_booking = models.BooleanField(default=True)
    notify_payment_received = models.BooleanField(default=True)
    notification_recipients = models.CharField(max_length=400, blank=True, default="")
    smtp_host = models.CharField(max_length=200, blank=True, default="")
    smtp_port = models.PositiveIntegerField(default=587)
    smtp_user = models.CharField(max_length=200, blank=True, default="")
    smtp_password = models.CharField(max_length=200, blank=True, default="")
    smtp_use_tls = models.BooleanField(default=True)
    smtp_use_ssl = models.BooleanField(default=False)
    damage_parts = models.JSONField(default=_default_damage_parts, blank=True)
    damage_types = models.JSONField(default=_default_damage_types, blank=True)
    insurers = models.JSONField(default=_default_insurers, blank=True)
    homepage_services = models.JSONField(default=_default_homepage_services, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Portal Einstellungen"

    class Meta:
        verbose_name = "Portal Einstellung"
        verbose_name_plural = "Portal Einstellungen"


class AuditLog(models.Model):
    action = models.CharField(max_length=120)
    actor = models.ForeignKey("auth.User", null=True, blank=True, on_delete=models.SET_NULL)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.created_at:%Y-%m-%d %H:%M} · {self.action}"

# Create your models here.
