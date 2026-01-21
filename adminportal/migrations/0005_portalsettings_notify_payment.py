from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("adminportal", "0004_invoice_payments_reminders"),
    ]

    operations = [
        migrations.AddField(
            model_name="portalsettings",
            name="notify_payment_received",
            field=models.BooleanField(default=True),
        ),
    ]
