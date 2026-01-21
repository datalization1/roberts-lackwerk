import re
from django.core.exceptions import ValidationError


class PasswordComplexityValidator:
    def validate(self, password, user=None):
        if len(password or "") < 10:
            raise ValidationError("Passwort muss mindestens 10 Zeichen lang sein.")
        if not re.search(r"[A-Z]", password or ""):
            raise ValidationError("Passwort muss mindestens einen Großbuchstaben enthalten.")
        if not re.search(r"[a-z]", password or ""):
            raise ValidationError("Passwort muss mindestens einen Kleinbuchstaben enthalten.")
        if not re.search(r"\\d", password or ""):
            raise ValidationError("Passwort muss mindestens eine Zahl enthalten.")

    def get_help_text(self):
        return "Passwort muss mindestens 10 Zeichen, Groß-/Kleinbuchstaben und eine Zahl enthalten."
