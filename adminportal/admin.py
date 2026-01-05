from django.contrib import admin
from django.utils import timezone

from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "customer", "amount_chf", "status", "due_date", "reminder_level", "payment_date")
    list_filter = ("status", "reminder_level", "issue_date", "due_date")
    search_fields = ("invoice_number", "customer__first_name", "customer__last_name", "customer__email")
    actions = ["mark_as_paid"]
    readonly_fields = ("payment_events",)

    def mark_as_paid(self, request, queryset):
        today = timezone.localdate()
        for inv in queryset:
            inv.status = "paid"
            inv.payment_date = today
            inv.add_event("paid", "Manuell als bezahlt markiert")
            inv.save(update_fields=["status", "payment_date", "payment_events", "updated_at"])
        self.message_user(request, f"{queryset.count()} Rechnung(en) als bezahlt markiert.")

    mark_as_paid.short_description = "Als bezahlt markieren"
