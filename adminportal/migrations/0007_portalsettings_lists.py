from django.db import migrations, models


def default_damage_parts():
    return [
        "Frontstossstange",
        "Heckstossstange",
        "Tür vorne links",
        "Tür vorne rechts",
        "Tür hinten links",
        "Tür hinten rechts",
        "Kotflügel vorne links",
        "Kotflügel vorne rechts",
        "Kotflügel hinten links",
        "Kotflügel hinten rechts",
        "Motorhaube",
        "Heckklappe",
        "Frontscheibe",
        "Heckscheibe",
        "Seitenspiegel links",
        "Seitenspiegel rechts",
        "Scheinwerfer links",
        "Scheinwerfer rechts",
        "Rücklicht links",
        "Rücklicht rechts",
        "Dach",
        "Felgen/Räder",
        "Sonstiges",
    ]


def default_damage_types():
    return [
        "Unfallschaden",
        "Hagelschaden",
        "Parkschaden",
        "Wildschaden",
        "Vandalismus",
        "Sonstiges",
    ]


def default_insurers():
    return [
        "Allianz Suisse",
        "AXA",
        "Baloise",
        "Die Mobiliar",
        "Generali",
        "Helvetia",
        "Zurich",
        "Vaudoise",
        "TCS",
        "Simpego",
        "Smile",
        "PostFinance",
        "Andere",
        "Ohne Versicherung melden",
    ]


class Migration(migrations.Migration):

    dependencies = [
        ("adminportal", "0006_auditlog"),
    ]

    operations = [
        migrations.AddField(
            model_name="portalsettings",
            name="damage_parts",
            field=models.JSONField(blank=True, default=default_damage_parts),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="damage_types",
            field=models.JSONField(blank=True, default=default_damage_types),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="insurers",
            field=models.JSONField(blank=True, default=default_insurers),
        ),
    ]
