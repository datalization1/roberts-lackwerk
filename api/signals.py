from django.contrib.auth.models import Group
from django.db.models.signals import post_migrate
from django.dispatch import receiver


@receiver(post_migrate)
def ensure_default_groups(sender, **kwargs):
    if sender.name != "api":
        return
    for name in ["admin", "manager", "employee"]:
        Group.objects.get_or_create(name=name)
