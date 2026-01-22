from io import BytesIO
from decimal import Decimal

from django.utils import timezone
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def render_booking_invoice_pdf(booking, rental_days, base_price, extras_total, vat_amount, total_price):
    """
    Simple PDF invoice for booking confirmation emails.
    Returns PDF bytes.
    """
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 60
    p.setFont("Helvetica-Bold", 18)
    p.drawString(40, y, f"Rechnung BU-{booking.id}")
    y -= 20
    p.setFont("Helvetica", 10)
    p.drawString(40, y, f"Datum: {timezone.localdate()} | Kunde: {booking.customer_name}")
    y -= 24

    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, "Buchungsdetails")
    y -= 16
    p.setFont("Helvetica", 10)
    p.drawString(40, y, f"Fahrzeug: {booking.transporter.name} ({booking.transporter.kennzeichen})")
    y -= 14
    p.drawString(40, y, f"Zeitraum: {booking.pickup_date or booking.date} bis {booking.return_date or booking.date} ({rental_days} Tag(e))")
    y -= 20

    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, "Positionen")
    y -= 16
    p.setFont("Helvetica", 10)
    p.drawString(40, y, f"Fahrzeugmiete: CHF {base_price or Decimal('0.00')}")
    y -= 14
    if extras_total:
        p.drawString(40, y, f"Extras: CHF {extras_total}")
        y -= 14

    p.drawString(40, y, f"Zwischensumme: CHF {base_price or Decimal('0.00') + (extras_total or Decimal('0.00'))}")
    y -= 14
    p.drawString(40, y, f"MwSt. 7.7% (inkl.): CHF {vat_amount}")
    y -= 16
    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, f"Gesamt: CHF {total_price}")

    p.showPage()
    p.save()
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
