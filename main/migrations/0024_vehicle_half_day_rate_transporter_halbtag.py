from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0023_alter_booking_payment_method_alter_booking_status_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="vehicle",
            name="half_day_rate",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
        migrations.AddField(
            model_name="transporter",
            name="halbtag_preis_chf",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=7, verbose_name="Halbtag (CHF)"),
        ),
    ]
