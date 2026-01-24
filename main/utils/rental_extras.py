from decimal import Decimal, InvalidOperation
from django.utils.text import slugify


def normalize_rental_extras(items):
    normalized = []
    used_keys = set()

    for item in items or []:
        if isinstance(item, str):
            name = item.strip()
            if not name:
                continue
            entry = {
                "name": name,
                "description": "",
                "price": Decimal("0.00"),
                "active": True,
                "key": slugify(name) or f"extra-{len(normalized) + 1}",
            }
        elif isinstance(item, dict):
            name = (item.get("name") or item.get("label") or item.get("title") or "").strip()
            if not name:
                continue
            raw_key = (item.get("key") or "").strip()
            key = raw_key or (slugify(name) or f"extra-{len(normalized) + 1}")
            description = (item.get("description") or item.get("text") or "").strip()
            price_raw = item.get("price", 0)
            try:
                price = Decimal(str(price_raw))
            except (InvalidOperation, TypeError):
                price = Decimal("0.00")
            entry = {
                "name": name,
                "description": description,
                "price": price,
                "active": item.get("active", True),
                "key": key,
            }
        else:
            continue

        base_key = entry["key"]
        suffix = 1
        while entry["key"] in used_keys:
            suffix += 1
            entry["key"] = f"{base_key}-{suffix}"
        used_keys.add(entry["key"])
        normalized.append(entry)

    return normalized
