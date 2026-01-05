import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone

from adminportal.models import Invoice


class Command(BaseCommand):
    help = "Markiert überfällige Rechnungen und setzt Mahnstufe (7/14/21 Tage). Optionaler Heroku-Scheduler-Job."

    def handle(self, *args, **options):
        today = timezone.localdate()
        reminded = 0
        overdue_marked = 0

        qs = Invoice.objects.filter(status__in=["pending", "overdue"]).exclude(due_date__isnull=True)
        for inv in qs:
            days_overdue = (today - inv.due_date).days
            # Status auf overdue setzen, falls fällig
            if days_overdue > 0 and inv.status == "pending":
                inv.status = "overdue"
                overdue_marked += 1

            target_level = 0
            if days_overdue >= 21:
                target_level = 3
            elif days_overdue >= 14:
                target_level = 2
            elif days_overdue >= 7:
                target_level = 1

            if target_level > inv.reminder_level:
                inv.reminder_level = target_level
                inv.last_reminded_at = today
                inv.add_event("reminder", f"Mahnstufe {target_level} gesetzt ({days_overdue} Tage überfällig)")
                reminded += 1

            inv.save(update_fields=["status", "reminder_level", "last_reminded_at", "payment_events", "updated_at"])

        self.stdout.write(self.style.SUCCESS(f"Reminders aktualisiert: {reminded}, Overdue gesetzt: {overdue_marked}"))
