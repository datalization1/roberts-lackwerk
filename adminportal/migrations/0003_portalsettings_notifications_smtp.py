from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("adminportal", "0002_portalsettings"),
    ]

    operations = [
        migrations.AddField(
            model_name="portalsettings",
            name="notify_new_booking",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="notify_new_damage",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="notification_recipients",
            field=models.CharField(blank=True, default="", max_length=400),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="smtp_host",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="smtp_password",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="smtp_port",
            field=models.PositiveIntegerField(default=587),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="smtp_use_ssl",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="smtp_use_tls",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="portalsettings",
            name="smtp_user",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
    ]
