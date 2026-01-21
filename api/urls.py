from django.urls import include, path
from rest_framework import routers

from .views import (
    BookingViewSet,
    CustomerViewSet,
    DamageReportViewSet,
    InvoiceViewSet,
    TransporterViewSet,
    VehicleViewSet,
)
from .viewsets_uploads import DamageDocumentUploadView, DamagePhotoUploadView
from .meta import MetaOptionsView
from .auth_views import LoginView, LogoutView, MeView
from .stripe_views import PaymentIntentCreateView, StripeWebhookView

router = routers.DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"damage-reports", DamageReportViewSet, basename="damage-report")
router.register(r"transporters", TransporterViewSet, basename="transporter")
router.register(r"bookings", BookingViewSet, basename="booking")
router.register(r"vehicles", VehicleViewSet, basename="vehicle")
router.register(r"invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path("", include(router.urls)),
    path("damage-reports/<int:pk>/upload-photo/", DamagePhotoUploadView.as_view(), name="damage-report-upload-photo"),
    path("damage-reports/<int:pk>/upload-document/", DamageDocumentUploadView.as_view(), name="damage-report-upload-document"),
    path("meta/options/", MetaOptionsView.as_view(), name="meta-options"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("payments/create-intent/", PaymentIntentCreateView.as_view(), name="stripe-create-intent"),
    path("stripe/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
