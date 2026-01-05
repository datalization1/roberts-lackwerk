from datetime import date
from decimal import Decimal


DAILY_RATES = {
    "small": Decimal("89"),
    "medium": Decimal("109"),
    "large": Decimal("139"),
}

KM_PACKAGE_PRICES = {
    "100km": Decimal("0"),
    "200km": Decimal("25"),
    "unlimited": Decimal("60"),
}

INSURANCE_PRICES = {
    "basic": Decimal("0"),
    "full": Decimal("25"),
    "premium": Decimal("45"),
}

EXTRA_PRICES = {
    "moebeldecken": Decimal("15"),
    "sackkarre": Decimal("10"),
    "zurrgurte": Decimal("8"),
    "navi": Decimal("12"),
    "zusatzfahrer": Decimal("20"),
    "winterreifen": Decimal("25"),
}
ALLOWED_EXTRA_CODES = set(EXTRA_PRICES.keys())


def calculate_total_price(vehicle_type, pickup_date, return_date, km_package, insurance, extras=None):
    extras = extras or []
    if not pickup_date or not return_date:
        return Decimal("0")
    days = (return_date - pickup_date).days + 1
    if days < 1:
        days = 1

    base_rate = DAILY_RATES.get(vehicle_type, Decimal("0")) * days
    km_price = KM_PACKAGE_PRICES.get(km_package, Decimal("0"))
    insurance_price = INSURANCE_PRICES.get(insurance, Decimal("0")) * days
    extras_sum = sum(EXTRA_PRICES.get(code, Decimal("0")) for code in extras)
    return base_rate + km_price + insurance_price + extras_sum
