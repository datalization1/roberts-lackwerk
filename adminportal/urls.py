from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard, name="portal_dashboard"),
    path("schadenmeldungen/", views.damage_reports, name="portal_damage_reports"),
    path("buchungen/", views.bookings, name="portal_bookings"),
    path("buchungen/<int:pk>/", views.booking_detail, name="portal_booking_detail"),
    path("fahrzeuge/", views.vehicles, name="portal_vehicles"),
    path("kunden/", views.customers, name="portal_customers"),
    path("rechnungen/", views.invoices, name="portal_invoices"),
    path("rechnungen/<int:pk>/pdf/", views.invoice_pdf, name="portal_invoice_pdf"),
    path("zeitplan/", views.schedule, name="portal_schedule"),
    path("verfuegbarkeit/", views.availability, name="portal_availability"),
    path("einstellungen/", views.settings_view, name="portal_settings"),
    path("schadenmeldungen/<int:pk>/", views.damage_report_detail, name="portal_damage_report_detail"),
]
