from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("adminportal", "0011_invoice_items_vat_rate_vat_included"),
    ]

    operations = [
        migrations.AddField(
            model_name="portalsettings",
            name="rental_extras",
            field=models.JSONField(
                blank=True,
                default=[
                    {
                        "key": "additional_insurance",
                        "name": "Zusätzliche Versicherung",
                        "description": "Zusätzlicher Schutz für Ihre Buchung und Sicherheit.",
                        "price": 25,
                        "active": True,
                    },
                    {
                        "key": "moving_blankets",
                        "name": "Umzugsdecken",
                        "description": "Schützt Möbel vor Kratzern und Stößen.",
                        "price": 15,
                        "active": True,
                    },
                    {
                        "key": "hand_truck",
                        "name": "Sackkarre / Transportwagen",
                        "description": "Hilft beim Transport schwerer Gegenstände.",
                        "price": 10,
                        "active": True,
                    },
                    {
                        "key": "tie_down_straps",
                        "name": "Zurrgurte (4 Stück)",
                        "description": "Sichert Ihre Ladung für den Transport.",
                        "price": 8,
                        "active": True,
                    },
                ],
            ),
        ),
    ]
