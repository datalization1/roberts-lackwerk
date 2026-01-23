from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("adminportal", "0010_merge_20260122_1514"),
    ]

    operations = [
        migrations.AddField(
            model_name="invoice",
            name="items",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="invoice",
            name="vat_rate",
            field=models.DecimalField(decimal_places=2, default=7.7, max_digits=4),
        ),
        migrations.AddField(
            model_name="invoice",
            name="vat_included",
            field=models.BooleanField(default=True),
        ),
    ]
