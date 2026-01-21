from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("main", "0019_booking_driver_license_photo_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="invoice",
            name="invoice_number",
            field=models.CharField(blank=True, max_length=40, null=True, unique=True),
        ),
    ]
