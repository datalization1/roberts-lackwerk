from django.conf import settings
from django.core.cache import cache


def get_client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def is_rate_limited(key, limit=None):
    limit = limit or getattr(settings, "LOGIN_RATE_LIMIT", 5)
    count = cache.get(key, 0)
    return count >= limit


def register_failed_attempt(key, limit=None, window=None):
    limit = limit or getattr(settings, "LOGIN_RATE_LIMIT", 5)
    window = window or getattr(settings, "LOGIN_RATE_WINDOW", 900)
    try:
        count = cache.incr(key)
    except ValueError:
        cache.set(key, 1, timeout=window)
        count = 1
    return count >= limit


def reset_rate_limit(key):
    cache.delete(key)
