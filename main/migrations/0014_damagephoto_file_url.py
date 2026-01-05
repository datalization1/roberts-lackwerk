from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("main", "0013_customer_vehicle_booking_created_at_booking_extras_and_more"),
    ]

    def _populate_urls(apps, schema_editor):
        DamagePhoto = apps.get_model("main", "DamagePhoto")
        for photo in DamagePhoto.objects.all():
            if getattr(photo, "image", None):
                try:
                    photo.file_url = photo.image.url
                    photo.save(update_fields=["file_url"])
                except Exception:
                    # Falls Storage/URL noch nicht verfügbar, einfach überspringen
                    continue

    def _noop(apps, schema_editor):
        pass

    operations = [
        migrations.AddField(
            model_name="damagephoto",
            name="file_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.RunPython(_populate_urls, _noop),
    ]
