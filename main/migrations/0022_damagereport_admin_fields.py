from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0021_damage_report_status_cancelled"),
    ]

    operations = [
        migrations.AddField(
            model_name="damagereport",
            name="priority",
            field=models.CharField(
                choices=[
                    ("low", "Niedrig"),
                    ("normal", "Normal"),
                    ("high", "Hoch"),
                    ("urgent", "Dringend"),
                ],
                default="normal",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="damagereport",
            name="estimated_cost_chf",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="damagereport",
            name="repair_start",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="damagereport",
            name="repair_end",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="damagereport",
            name="assigned_mechanic",
            field=models.CharField(blank=True, max_length=120),
        ),
    ]
