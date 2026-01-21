from datetime import date
from django import forms
import logging
import re

from .models import CAR_PART_CHOICES, TIME_SLOTS, INSURER_CHOICES, INSURER_OTHER, INSURER_NO, Booking, DAMAGE_PART_CODES, DAMAGED_PART_CHOICES

class MultipleFileInput(forms.ClearableFileInput):
    """
    File-Input, der mehrere Dateien akzeptiert.
    """
    allow_multiple_selected = True


class MultipleFileField(forms.FileField):
    """
    FileField, das immer eine Liste von Dateien zurückgibt.
    """
    widget = MultipleFileInput(attrs={
        "accept": "image/jpeg,image/png,image/jpg"
    })

    def __init__(self, *args, allowed_types=None, max_files=5, max_size_mb=5, **kwargs):
        super().__init__(*args, **kwargs)
        self.allowed_types = set(allowed_types) if allowed_types else None
        self.max_files = max_files
        self.max_size_mb = max_size_mb

    def clean(self, data, initial=None):
        # Bypass parent clean, damit wir Listen unverändert verarbeiten können
        if not data:
            return []
        if isinstance(data, (list, tuple)):
            file_list = list(data)
        else:
            file_list = [data]

        if len(file_list) > self.max_files:
            raise forms.ValidationError(f"Maximal {self.max_files} Dateien erlaubt.")
        for f in file_list:
            if f.size > self.max_size_mb * 1024 * 1024:
                raise forms.ValidationError(f"{f.name}: Datei ist größer als {self.max_size_mb} MB.")
            if self.allowed_types and getattr(f, "content_type", None) not in self.allowed_types:
                raise forms.ValidationError(f"{f.name}: Dateityp nicht erlaubt.")
        return file_list

# ---------- Schaden melden: Step 1 ----------
class CarDetailsForm(forms.Form):
    plate = forms.CharField(label="Kontrollschild *", max_length=16, required=True,
                            widget=forms.TextInput(attrs={"class":"form-control", "placeholder":"z.B. ZH 123456"}))
    car_brand = forms.CharField(label="Fahrzeugmarke *", max_length=80,
                                widget=forms.TextInput(attrs={"class":"form-control","placeholder":"z.B. BMW, Audi, VW"}))
    car_model = forms.CharField(label="Fahrzeugmodell *", max_length=80,
                                widget=forms.TextInput(attrs={"class":"form-control","placeholder":"z.B. 3er, A4, Golf"}))
    vin = forms.CharField(
        label="Stammnummer (12-stellig)",
        max_length=32,
        required=False,
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "z.B. 123.456.789",
                "inputmode": "numeric",
            }
        ),
    )
    type_certificate_number = forms.CharField(
        label="Typenscheinnummer (6-stellig)",
        max_length=16,
        required=False,
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "z.B. 123456",
                "inputmode": "numeric",
            }
        ),
    )
    registration_document = forms.FileField(
        label="Fahrzeugausweis (Foto/PDF)",
        required=False,
        widget=forms.ClearableFileInput(
            attrs={
                "class": "form-control",
                "accept": "image/jpeg,image/png,application/pdf",
                "capture": "environment",  # erlaubt direktes Fotografieren auf mobilen Geräten
            }
        ),
    )

    def clean_plate(self):
        plate = (self.cleaned_data.get("plate") or "").strip().upper()
        match = re.match(r"^(?P<canton>[A-Z]{2})\s?(?P<number>\d{1,6})$", plate)
        if not match:
            raise forms.ValidationError("Kontrollschild muss dem Format 'ZH123456' oder 'ZH 123456' entsprechen.")
        return f"{match.group('canton')}{match.group('number')}"

    def clean_vin(self):
        vin = (self.cleaned_data.get("vin") or "").strip()
        if not vin:
            return vin
        digits = re.sub(r"\D", "", vin)
        if len(digits) != 9:
            raise forms.ValidationError("Stammnummer muss 9-stellig sein (z.B. 123.456.789).")
        return f"{digits[:3]}.{digits[3:6]}.{digits[6:]}"

    def clean_type_certificate_number(self):
        num = (self.cleaned_data.get("type_certificate_number") or "").strip()
        if not num:
            return num
        if not re.match(r"^\d{6}$", num):
            raise forms.ValidationError("Typenscheinnummer muss 6-stellig sein.")
        return num

# ---------- Schaden melden: Step 2 ----------
class PersonalDetailsForm(forms.Form):
    first_name = forms.CharField(label="Vorname *", max_length=80,
                                widget=forms.TextInput(attrs={"class":"form-control","placeholder":"Vorname"}))
    last_name = forms.CharField(label="Nachname *", max_length=80,
                                widget=forms.TextInput(attrs={"class":"form-control","placeholder":"Nachname"}))
    address_street = forms.CharField(label="Strasse & Nr. *", max_length=200,
                              widget=forms.TextInput(attrs={"class":"form-control","placeholder":"z.B. Bahnhofstrasse 1"}))
    postal_code = forms.CharField(label="PLZ *", max_length=10,
                              widget=forms.TextInput(attrs={"class":"form-control","placeholder":"8000"}))
    city = forms.CharField(label="Ort *", max_length=120,
                              widget=forms.TextInput(attrs={"class":"form-control","placeholder":"Zürich"}))
    phone = forms.CharField(label="Telefon *", max_length=50, required=True,
                            widget=forms.TextInput(attrs={
                                "class":"form-control",
                                "placeholder":"+41 XX XXX XX XX",
                                "pattern": r"^(\+41|0).{7,}$",
                                "title": "Telefonnummer bitte mit +41 oder 0 beginnen",
                                "inputmode": "tel",
                            }))
    email = forms.EmailField(label="E-Mail *",
                             widget=forms.EmailInput(attrs={"class":"form-control","placeholder":"name@example.com"}))

    def clean_postal_code(self):
        code = (self.cleaned_data.get("postal_code") or "").strip()
        if not re.match(r"^\d{4}$", code):
            raise forms.ValidationError("PLZ muss 4-stellig sein.")
        return code

    def clean_phone(self):
        phone = (self.cleaned_data.get("phone") or "").strip()
        digits = "".join(ch for ch in phone if ch.isdigit())
        if not (phone.startswith("+41") or phone.startswith("0")):
            raise forms.ValidationError("Telefonnummer muss mit +41 oder 0 beginnen.")
        if len(digits) < 9:
            raise forms.ValidationError("Telefonnummer ist zu kurz.")
        return phone


# ---------- Schaden melden: Step 3 ----------
class InsuranceDetailsForm(forms.Form):
    insurer = forms.ChoiceField(
        label="Versicherung *",
        choices=INSURER_CHOICES,
        widget=forms.Select(attrs={"class": "form-select"}),
    )
    policy_number = forms.CharField(
        label="Policennummer",
        max_length=64,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Falls vorhanden"}),
    )
    other_insurer = forms.CharField(
        label="Andere Versicherung",
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Name der Versicherung"}),
    )
    accident_number = forms.CharField(
        label="Schadennummer",
        max_length=64,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Claim/Accident reference number"}),
    )
    insurer_contact = forms.CharField(
        label="Kontakt bei der Versicherung",
        max_length=120,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Kontaktperson"}),
    )
    insurer_contact_phone = forms.CharField(
        label="Telefon Kontaktperson",
        max_length=50,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Telefon (optional)"}),
    )
    insurer_contact_email = forms.EmailField(
        label="E-Mail Kontaktperson",
        required=False,
        widget=forms.EmailInput(attrs={"class": "form-control", "placeholder": "E-Mail (optional)"}),
    )

    def _active_items(self, items):
        active = []
        for item in items or []:
            if isinstance(item, dict):
                name = item.get("name") or item.get("label") or item.get("title")
                if not name:
                    continue
                if item.get("active", True):
                    active.append(name)
            elif isinstance(item, str):
                active.append(item)
        return active

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        settings = None
        try:
            from adminportal.models import PortalSettings
            settings = PortalSettings.objects.first()
        except Exception:
            settings = None
        insurers_raw = list(settings.insurers or []) if settings and settings.insurers else []
        insurers = self._active_items(insurers_raw)
        if not insurers:
            insurers = [label for value, label in INSURER_CHOICES if value not in [INSURER_OTHER, INSURER_NO]]
            insurers.extend(["Andere", "Ohne Versicherung melden"])
        insurers = [name for name in insurers if name not in ["Andere", "Ohne Versicherung melden"]]
        choices = [(name, name) for name in insurers]
        choices.append((INSURER_OTHER, "Andere"))
        choices.append((INSURER_NO, "Ohne Versicherung melden"))
        self.fields["insurer"].choices = choices

    def clean(self):
        cleaned = super().clean()
        insurer = cleaned.get("insurer")
        if insurer == INSURER_OTHER and not cleaned.get("other_insurer"):
            self.add_error("other_insurer", "Bitte die Versicherung angeben.")
        phone = (cleaned.get("insurer_contact_phone") or "").strip()
        if phone:
            digits = "".join(ch for ch in phone if ch.isdigit())
            if not (phone.startswith("+41") or phone.startswith("0")):
                self.add_error("insurer_contact_phone", "Telefonnummer muss mit +41 oder 0 beginnen.")
            elif len(digits) < 9:
                self.add_error("insurer_contact_phone", "Telefonnummer ist zu kurz.")
        return cleaned


# ---------- Schaden melden: Step 4 ----------
DAMAGE_MULTI_CHOICES = [(k, v) for k, v in CAR_PART_CHOICES if k != "OTHER"] + [("OTHER", "Sonstiges")]

class AccidentDetailsForm(forms.Form):
    DAMAGE_TYPE_CHOICES = [
        ("Unfallschaden", "Unfallschaden"),
        ("Hagelschaden", "Hagelschaden"),
        ("Parkschaden", "Parkschaden"),
        ("Wildschaden", "Wildschaden"),
        ("Vandalismus", "Vandalismus"),
        ("Sonstiges", "Sonstiges"),
    ]

    damaged_parts = forms.MultipleChoiceField(
        label="Beschädigte Teile",
        choices=DAMAGE_PART_CODES,              # kommt aus models.py
        widget=forms.CheckboxSelectMultiple,
        required=False,
    )

    accident_date = forms.DateField(
        label="Unfalldatum",
        widget=forms.DateInput(attrs={"type": "date", "class": "form-control", "data-max-today": "true"}),
        required=True,
    )

    accident_location = forms.CharField(
        label="Unfallort",
        max_length=200,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Ort des Unfalls"}),
        required=True,
    )

    damage_type = forms.ChoiceField(
        label="Schadensart",
        choices=DAMAGE_TYPE_CHOICES,
        widget=forms.Select(attrs={"class": "form-select"}),
        required=True,
    )

    message = forms.CharField(
        label="Schadenbeschreibung",
        required=True,
        widget=forms.Textarea(
            attrs={
                "class": "form-control",
                "rows": 4,
                "placeholder": "Beschreiben Sie den Schaden so genau wie möglich.",
                "minlength": "20",
            }
        ),
    )

    photos = MultipleFileField(
        label="Schadenfotos",
        required=False,
        widget=MultipleFileInput(
            attrs={
                "accept": "image/jpeg,image/png,image/webp",
                "data-max-size": "5",  # MB
                "data-max-files": "5",
            }
        ),
        allowed_types={"image/jpeg", "image/png", "image/webp"},
        max_size_mb=5,
    )

    def _active_items(self, items):
        active = []
        for item in items or []:
            if isinstance(item, dict):
                name = item.get("name") or item.get("label") or item.get("title")
                if not name:
                    continue
                if item.get("active", True):
                    active.append(name)
            elif isinstance(item, str):
                active.append(item)
        return active

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        settings = None
        try:
            from adminportal.models import PortalSettings
            settings = PortalSettings.objects.first()
        except Exception:
            settings = None
        parts_raw = list(settings.damage_parts or []) if settings and settings.damage_parts else []
        parts = self._active_items(parts_raw)
        if not parts:
            parts = [label for _, label in DAMAGE_PART_CODES]
        self.fields["damaged_parts"].choices = [(name, name) for name in parts]
        damage_types_raw = list(settings.damage_types or []) if settings and settings.damage_types else []
        damage_types = self._active_items(damage_types_raw)
        if not damage_types:
            damage_types = [label for label, _ in self.DAMAGE_TYPE_CHOICES]
        self.fields["damage_type"].choices = [(name, name) for name in damage_types]

    documents = MultipleFileField(
        label="Dokumente (Polizeibericht/Skizze)",
        required=False,
        widget=MultipleFileInput(
            attrs={
                "accept": "application/pdf,image/jpeg,image/png,image/webp",
                "data-max-size": "8",
                "data-max-files": "5",
            }
        ),
        allowed_types={"application/pdf", "image/jpeg", "image/png", "image/webp"},
        max_size_mb=8,
    )

    other_party_involved = forms.BooleanField(label="Unfallgegner vorhanden", required=False)
    police_involved = forms.BooleanField(label="Polizei involviert", required=False)

    def clean_accident_date(self):
        accident_date = self.cleaned_data.get("accident_date")
        if accident_date and accident_date > date.today():
            raise forms.ValidationError("Unfalldatum darf nicht in der Zukunft liegen.")
        return accident_date

# ---------- Schaden melden: Step 5 ----------
class ReviewForm(forms.Form):
    confirm = forms.BooleanField(label="Ich bestätige, dass die Angaben korrekt sind.", required=True)


# ---------- Buchung (Transporter) ----------
class BookingForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["driver_license_number"].required = True

    class Meta:
        model = Booking
        fields = [
            "customer_name",
            "customer_address",
            "customer_phone",
            "customer_email",
            "driver_license_number",
            "driver_license_photo",
        ]
        widgets = {
            "customer_phone": forms.TextInput(attrs={
                "placeholder": "+41 XX XXX XX XX",
                "pattern": r"^(\+41|0).{7,}$",
                "title": "Telefonnummer bitte mit +41 oder 0 beginnen",
                "inputmode": "tel",
            }),
            "driver_license_number": forms.TextInput(attrs={
                "minlength": "5",
                "placeholder": "Schweizer Führerscheinnummer (optional)",
            }),
            "driver_license_photo": forms.ClearableFileInput(attrs={
                "accept": "image/jpeg,image/png,application/pdf",
                "capture": "environment",
            }),
        }

    def clean(self):
        cleaned = super().clean()
        transporter = cleaned.get("transporter")
        date = cleaned.get("date")
        slot = cleaned.get("time_slot")

        if transporter and date and slot:
            existing = Booking.objects.filter(
                transporter=transporter,
                date=date
            ).values_list("time_slot", flat=True)

            if slot == "FULLDAY":
                if existing:
                    raise forms.ValidationError("Ganztagsbuchung nicht möglich – es existiert bereits eine Teilbuchung.")
            elif slot == "MORNING":
                if "FULLDAY" in existing:
                    raise forms.ValidationError("Vormittagsbuchung nicht möglich – ganzer Tag ist gebucht.")
            elif slot == "AFTERNOON":
                if "FULLDAY" in existing:
                    raise forms.ValidationError("Nachmittagsbuchung nicht möglich – ganzer Tag ist gebucht.")
        phone = (cleaned.get("customer_phone") or "").strip()
        digits = "".join(ch for ch in phone if ch.isdigit())
        if not (phone.startswith("+41") or phone.startswith("0")):
            self.add_error("customer_phone", "Telefonnummer muss mit +41 oder 0 beginnen.")
        elif len(digits) < 9:
            self.add_error("customer_phone", "Telefonnummer ist zu kurz.")
        license_number = (cleaned.get("driver_license_number") or "").strip()
        if license_number and len(license_number) < 5:
            self.add_error("driver_license_number", "Führerscheinnummer scheint zu kurz.")
        return cleaned


# --- Verfügbarkeits-Suche (Datum + Slot) ---
class AvailabilitySearchForm(forms.Form):
    date = forms.DateField(
        label="Datum",
        widget=forms.DateInput(attrs={"type": "date", "class": "form-control"}),
    )
    time_slot = forms.ChoiceField(
        label="Zeitfenster",
        choices=[("MORNING", "Vormittag (08:00–12:00)"),
                 ("AFTERNOON", "Nachmittag (13:00–17:00)"),
                 ("FULLDAY", "Ganzer Tag (08:00–17:00)")],
        widget=forms.Select(attrs={"class": "form-select"})
    )
