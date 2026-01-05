from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def apply_smtp_override(portal_settings):
    """
    Überschreibt SMTP-Einstellungen zur Laufzeit, falls im Portal konfiguriert.
    """
    if not portal_settings:
        return
    if portal_settings.smtp_host:
        settings.EMAIL_HOST = portal_settings.smtp_host
    if portal_settings.smtp_port:
        settings.EMAIL_PORT = portal_settings.smtp_port
    if portal_settings.smtp_user:
        settings.EMAIL_HOST_USER = portal_settings.smtp_user
    if portal_settings.smtp_password:
        settings.EMAIL_HOST_PASSWORD = portal_settings.smtp_password
    settings.EMAIL_USE_TLS = portal_settings.smtp_use_tls
    settings.EMAIL_USE_SSL = portal_settings.smtp_use_ssl


def send_templated_mail(subject, template_path, context, recipients, from_email=None, portal_settings=None):
    if not recipients:
        return
    apply_smtp_override(portal_settings)
    html_body = render_to_string(template_path, context)
    text_body = strip_tags(html_body)
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=from_email or getattr(settings, "DEFAULT_FROM_EMAIL", None),
        to=recipients,
    )
    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=True)
