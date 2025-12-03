from django.urls import path
from . import views
from .views import (
    home, dienstleistungen, ueber_uns,
    ClaimWizard, schaden_success,
    mietfahrzeuge, transporter_list, transporter_availability, book_transporter,
    available_transporters,
)

urlpatterns = [
    path("", home, name="home"),
    path("dienstleistungen/", dienstleistungen, name="dienstleistungen"),
    path("ueber-uns/", ueber_uns, name="ueber_uns"),
    path("impressum/", views.impressum, name="impressum"),
    path("datenschutz/", views.datenschutz, name="datenschutz"),

    # Schaden melden (Wizard)
    path("schaden/", ClaimWizard.as_view(), name="schaden"),
    path("schaden/melden/", ClaimWizard.as_view(), name="schaden_melden"),
    path("schaden/erfolg/<int:pk>/", schaden_success, name="schaden_success"),

    # Mietfahrzeuge
    path("mietfahrzeuge/", mietfahrzeuge, name="mietfahrzeuge"),
    path("mietfahrzeuge/liste/", transporter_list, name="transporter_list"),
    path("mietfahrzeuge/<int:transporter_id>/", transporter_availability, name="transporter_availability"),
    path("mietfahrzeuge/<int:transporter_id>/buchen/", book_transporter, name="booking_create"),
    path("mietfahrzeuge/verfuegbar/", available_transporters, name="available_transporters"),
    path("mietfahrzeuge/buchung/erfolg/<int:booking_id>/", views.booking_success, name="booking_success"),
    path("mietfahrzeuge/<int:transporter_id>/buchen/", book_transporter, name="booking_create"),
    path("mietfahrzeuge/buchung/zusaetzliche-optionen/", views.booking_options, name="booking_options"),
    path("mietfahrzeuge/verfuegbar/", available_transporters, name="available_transporters"),
    path("mietfahrzeuge/<int:transporter_id>/buchen/", book_transporter, name="booking_create"),
    path("mietfahrzeuge/buchung/zusaetzliche-optionen/", views.booking_options, name="booking_options"),
    path("mietfahrzeuge/buchung/review/", views.booking_review, name="booking_review"),          # Schritt 4
    path("mietfahrzeuge/buchung/zahlung/", views.booking_payment, name="booking_payment"),      # Schritt 5
    path("mietfahrzeuge/buchung/erfolg/<int:booking_id>/", views.booking_success, name="booking_success"),
    
    # Admin
    path("intern/login/", views.admin_login_view, name="admin_login"),
    path("intern/logout/", views.admin_logout_view, name="admin_logout"),
    path("intern/dashboard/", views.admin_dashboard_view, name="admin_dashboard"),
]