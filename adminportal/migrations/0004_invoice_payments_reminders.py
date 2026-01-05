from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ("adminportal", "0003_portalsettings_notifications_smtp"),
    ]

    operations = [
        migrations.AddField(
            model_name="invoice",
            name="last_reminded_at",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="invoice",
            name="payment_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="invoice",
            name="payment_events",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="invoice",
            name="payment_method",
            field=models.CharField(blank=True, max_length=30),
        ),
        migrations.AddField(
            model_name="invoice",
            name="reminder_level",
            field=models.PositiveSmallIntegerField(default=0),
        ),
    ]
