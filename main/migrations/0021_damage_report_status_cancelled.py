from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("main", "0020_invoice_invoice_number"),
    ]

    operations = [
        migrations.AlterField(
            model_name="damagereport",
            name="status",
            field=models.CharField(choices=[("pending", "Ausstehend"), ("in_progress", "In Bearbeitung"), ("completed", "Abgeschlossen"), ("cancelled", "Storniert")], default="pending", max_length=20),
        ),
    ]
