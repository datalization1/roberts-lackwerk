from django import template

register = template.Library()

@register.filter(name='add_class')
def add_class(field, css):
    return field.as_widget(attrs={"class": css})


@register.filter(name='split')
def split(value, sep=","):
    """Teilt einen String in eine Liste (für den Wizard-Stepper)."""
    if value is None:
        return []
    return [part.strip() for part in str(value).split(sep)]