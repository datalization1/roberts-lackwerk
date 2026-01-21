from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard, name="portal_dashboard"),
    path("schadenmeldungen/", views.damage_reports, name="portal_damage_reports"),
    path("buchungen/", views.bookings, name="portal_bookings"),
    path("buchungen/<int:pk>/", views.booking_detail, name="portal_booking_detail"),
    path("fahrzeuge/", views.vehicles, name="portal_vehicles"),
    path("kunden/", views.customers, name="portal_customers"),
    path("kunden/<int:pk>/", views.customer_detail, name="portal_customer_detail"),
    path("kunden/<int:pk>/export/", views.customer_export, name="portal_customer_export"),
    path("kunden/<int:pk>/anonymize/", views.customer_anonymize, name="portal_customer_anonymize"),
    path("kunden/<int:pk>/delete/", views.customer_delete, name="portal_customer_delete"),
    path("rechnungen/", views.invoices, name="portal_invoices"),
    path("rechnungen/export/", views.invoice_export, name="portal_invoice_export"),
    path("rechnungen/<int:pk>/pdf/", views.invoice_pdf, name="portal_invoice_pdf"),
    path("rechnungen/<int:pk>/paid/", views.invoice_mark_paid, name="portal_invoice_mark_paid"),
    path("rechnungen/<int:pk>/reminder/", views.invoice_raise_reminder, name="portal_invoice_raise_reminder"),
    path("zeitplan/", views.schedule, name="portal_schedule"),
    path("verfuegbarkeit/", views.availability, name="portal_availability"),
    path("einstellungen/", views.settings_view, name="portal_settings"),
    path("schadenmeldungen/<int:pk>/", views.damage_report_detail, name="portal_damage_report_detail"),
]
