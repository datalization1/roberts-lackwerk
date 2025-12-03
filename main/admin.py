from django.utils.html import format_html
from django.contrib import admin
from .models import DamageReport, DamagePhoto, Transporter, Booking

@admin.register(Transporter)
class TransporterAdmin(admin.ModelAdmin):
    list_display = ("name", "kennzeichen", "farbe", "preis_chf", "verfuegbar_ab", "buchung", "preview")

    def preview(self, obj):
        if obj.bild:
            return format_html('<img src="{}" style="height: 50px;"/>', obj.bild.url)
        return "-"
    preview.short_description = "Bild"

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("transporter", "date", "time_slot", "customer_name", "customer_email")
    list_filter = ("date", "time_slot", "transporter")
    search_fields = ("customer_name", "customer_email", "transporter__name", "transporter__kennzeichen")