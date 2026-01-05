from django import forms
from .models import CAR_PART_CHOICES, TIME_SLOTS, INSURER_CHOICES, INSURER_OTHER, Booking, DAMAGE_PART_CODES, DAMAGED_PART_CHOICES
import logging

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

    def clean(self, data, initial=None):
        files = super().clean(data, initial)
        if not files:
            return []
        # Django gibt bei multiple-Uploads bereits eine Liste zurück
        if isinstance(files, (list, tuple)):
            file_list = list(files)
        else:
            file_list = [files]

        max_files = 5
        max_size_mb = 5
        if len(file_list) > max_files:
            raise forms.ValidationError(f"Maximal {max_files} Dateien erlaubt.")
        for f in file_list:
            if f.size > max_size_mb * 1024 * 1024:
                raise forms.ValidationError(f"{f.name}: Datei ist größer als {max_size_mb} MB.")
        return file_list

# ---------- Schaden melden: Step 1 ----------
class CarDetailsForm(forms.Form):
    plate = forms.CharField(label="License Plate", max_length=16, required=False,
                            widget=forms.TextInput(attrs={"class":"form-control", "placeholder":"e.g., ZH 123456"}))
    car_brand = forms.CharField(label="Car Brand", max_length=80,
                                widget=forms.TextInput(attrs={"class":"form-control","placeholder":"e.g., BMW, Audi, VW"}))
    car_model = forms.CharField(label="Car Model", max_length=80,
                                widget=forms.TextInput(attrs={"class":"form-control","placeholder":"e.g., 3 Series, A4, Golf"}))
    vin = forms.CharField(label="Stammnummer (VIN)", max_length=32,
                          widget=forms.TextInput(attrs={"class":"form-control","placeholder":"17-digit vehicle identification number"}))


# ---------- Schaden melden: Step 2 ----------
class PersonalDetailsForm(forms.Form):
    full_name = forms.CharField(label="Full Name", max_length=160,
                                widget=forms.TextInput(attrs={"class":"form-control","placeholder":"First and Last Name"}))
    address = forms.CharField(label="Address", max_length=200,
                              widget=forms.TextInput(attrs={"class":"form-control","placeholder":"Street, City, Postal Code"}))
    phone = forms.CharField(label="Phone Number", max_length=50, required=False,
                            widget=forms.TextInput(attrs={
                                "class":"form-control",
                                "placeholder":"+41 XX XXX XX XX",
                                "pattern": r"^(\+41|0).{7,}$",
                                "title": "Telefonnummer bitte mit +41 oder 0 beginnen",
                                "inputmode": "tel",
                            }))
    email = forms.EmailField(label="Email Address",
                             widget=forms.EmailInput(attrs={"class":"form-control","placeholder":"your.email@example.com"}))


# ---------- Schaden melden: Step 3 ----------
class InsuranceDetailsForm(forms.Form):
    insurer = forms.ChoiceField(
        label="Insurance Company",
        choices=INSURER_CHOICES,
        widget=forms.Select(attrs={"class": "form-select"}),
    )
    policy_number = forms.CharField(
        label="Insurance Document Number",
        max_length=64,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "If available"}),
    )
    accident_number = forms.CharField(
        label="Accident Number",
        max_length=64,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Claim/Accident reference number"}),
    )
    insurer_contact = forms.CharField(
        label="Insurance Contact Person",
        max_length=120,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "Name of your insurance contact"}),
    )

    def clean(self):
        cleaned = super().clean()
        # Beispiel-Regel bei „Andere“ – optional:
        if cleaned.get("insurer") == INSURER_OTHER and not cleaned.get("policy_number"):
            # hier keine harte Pflicht; lass 'pass' stehen oder ergänze deine gewünschte Validierung
            pass
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
    )

# ---------- Schaden melden: Step 5 ----------
class ReviewForm(forms.Form):
    confirm = forms.BooleanField(label="I confirm the information is correct.", required=False)


# ---------- Buchung (Transporter) ----------
class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = [
            "customer_name",
            "customer_address",
            "customer_phone",
            "customer_email",
            "driver_license_number",
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
                "placeholder": "Schweizer Führerscheinnummer",
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
