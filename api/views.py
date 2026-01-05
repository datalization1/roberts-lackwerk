from rest_framework import permissions, viewsets

from main.models import Booking, Customer, DamageReport, Invoice, Transporter, Vehicle
from .permissions import AdminOrReadOnly, StaffOrPostOnly
from .serializers import (
    BookingSerializer,
    CustomerSerializer,
    DamageReportSerializer,
    InvoiceSerializer,
    TransporterSerializer,
    VehicleSerializer,
)
from .status_actions import add_status_actions


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("last_name", "first_name")
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAdminUser]


class DamageReportViewSet(viewsets.ModelViewSet):
    queryset = DamageReport.objects.select_related("customer").all().order_by("-created_at")
    serializer_class = DamageReportSerializer
    permission_classes = [StaffOrPostOnly]


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by("brand", "model")
    serializer_class = VehicleSerializer
    permission_classes = [AdminOrReadOnly]


class TransporterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transporter.objects.all().order_by("name")
    serializer_class = TransporterSerializer
    permission_classes = [AdminOrReadOnly]


@add_status_actions(
    field_name="status",
    transitions={
        "confirmed": ["pending"],
        "completed": ["pending", "confirmed"],
        "cancelled": ["pending", "confirmed"],
    },
)
class BookingViewSet(viewsets.ModelViewSet):
    queryset = (
        Booking.objects.select_related("transporter", "vehicle", "customer")
        .all()
        .order_by("-created_at")
    )
    serializer_class = BookingSerializer
    permission_classes = [StaffOrPostOnly]


@add_status_actions(
    field_name="status",
    transitions={
        "paid": ["unpaid", "overdue"],
        "overdue": ["unpaid"],
        "cancelled": ["unpaid", "overdue"],
    },
)
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("customer").all().order_by("-invoice_date")
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAdminUser]
