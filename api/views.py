from django.db.models import Q
from django.utils.dateparse import parse_date
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from main.models import Booking, Customer, DamageReport, Invoice, Transporter, Vehicle
from .permissions import AdminOrReadOnly, StaffOnly, StaffOrPostOnly
from .serializers import (
    BookingSerializer,
    CustomerSerializer,
    DamageReportSerializer,
    InvoiceSerializer,
    TransporterSerializer,
    VehicleSerializer,
)
from .status_actions import add_status_actions
from .validators import booking_range_conflict_exists, booking_slot_conflict_exists


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("last_name", "first_name")
    serializer_class = CustomerSerializer
    permission_classes = [StaffOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        q = (self.request.query_params.get("q") or "").strip()
        if q:
            qs = qs.filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(email__icontains=q)
                | Q(phone__icontains=q)
                | Q(company__icontains=q)
                | Q(city__icontains=q)
            )
        return qs


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by("brand", "model")
    serializer_class = VehicleSerializer
    permission_classes = [AdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        q = (self.request.query_params.get("q") or "").strip()
        status_param = (self.request.query_params.get("status") or "").strip()
        type_param = (self.request.query_params.get("type") or "").strip()
        next_service_before = parse_date(self.request.query_params.get("next_service_before") or "")
        next_service_after = parse_date(self.request.query_params.get("next_service_after") or "")

        if q:
            qs = qs.filter(
                Q(brand__icontains=q)
                | Q(model__icontains=q)
                | Q(license_plate__icontains=q)
                | Q(vin__icontains=q)
            )
        if status_param:
            qs = qs.filter(status=status_param)
        if type_param:
            qs = qs.filter(type=type_param)
        if next_service_before:
            qs = qs.filter(next_service__lte=next_service_before)
        if next_service_after:
            qs = qs.filter(next_service__gte=next_service_after)
        return qs


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

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def availability(self, request):
        transporter_id = request.query_params.get("transporter")
        vehicle_id = request.query_params.get("vehicle")
        pickup_date = parse_date(request.query_params.get("pickup_date") or "")
        return_date = parse_date(request.query_params.get("return_date") or "")
        booking_date = parse_date(request.query_params.get("date") or "")
        time_slot = request.query_params.get("time_slot")

        if not transporter_id and not vehicle_id:
            return Response(
                {"detail": "transporter oder vehicle erforderlich."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        transporter = Transporter.objects.filter(pk=transporter_id).first() if transporter_id else None
        vehicle = Vehicle.objects.filter(pk=vehicle_id).first() if vehicle_id else None
        if transporter_id and not transporter:
            return Response({"detail": "Transporter nicht gefunden."}, status=status.HTTP_404_NOT_FOUND)
        if vehicle_id and not vehicle:
            return Response({"detail": "Fahrzeug nicht gefunden."}, status=status.HTTP_404_NOT_FOUND)

        if pickup_date and return_date:
            conflict = booking_range_conflict_exists(
                transporter=transporter,
                vehicle=vehicle,
                pickup_date=pickup_date,
                return_date=return_date,
            )
            return Response({"available": not conflict})

        if booking_date and time_slot and transporter:
            conflict = booking_slot_conflict_exists(
                transporter=transporter,
                booking_date=booking_date,
                time_slot=time_slot,
            )
            return Response({"available": not conflict})

        return Response(
            {"detail": "Ungültige Parameter. Nutze pickup_date/return_date oder date/time_slot."},
            status=status.HTTP_400_BAD_REQUEST,
        )


@add_status_actions(
    field_name="status",
    transitions={
        "in_progress": ["pending"],
        "completed": ["pending", "in_progress"],
        "cancelled": ["pending", "in_progress"],
    },
)
class DamageReportViewSet(viewsets.ModelViewSet):
    queryset = DamageReport.objects.select_related("customer").all().order_by("-created_at")
    serializer_class = DamageReportSerializer
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
    permission_classes = [StaffOnly]

    @action(detail=False, methods=["get"], permission_classes=[StaffOnly])
    def next_number(self, request):
        return Response({"invoice_number": Invoice.generate_invoice_number()})
