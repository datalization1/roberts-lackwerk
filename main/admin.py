from django.utils.html import format_html
from django.contrib import admin
from .models import (
    Booking,
    Customer,
    DamagePhoto,
    DamageReport,
    Invoice,
    Transporter,
    Vehicle,
)

@admin.register(Transporter)
class TransporterAdmin(admin.ModelAdmin):
    list_display = ("name", "kennzeichen", "farbe", "preis_chf", "halbtag_preis_chf", "verfuegbar_ab", "buchung", "preview")

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


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "phone", "source", "customer_since")
    search_fields = ("first_name", "last_name", "email", "phone")
    list_filter = ("source",)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("license_plate", "brand", "model", "type", "status", "daily_rate", "half_day_rate")
    list_filter = ("type", "status")
    search_fields = ("license_plate", "brand", "model")


@admin.register(DamageReport)
class DamageReportAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "plate", "insurer", "status", "created_at")
    list_filter = ("status", "insurer")
    search_fields = ("first_name", "last_name", "plate", "policy_number", "accident_number")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "invoice_date", "total_amount", "status", "type")
    list_filter = ("status", "type")
    search_fields = ("id", "customer__first_name", "customer__last_name", "related_id")
