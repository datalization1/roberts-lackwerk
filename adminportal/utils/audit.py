from adminportal.models import AuditLog
from main.utils.security import get_client_ip


def log_audit(action, request=None, actor=None, metadata=None):
    ip_address = get_client_ip(request) if request else None
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:255] if request else ""
    AuditLog.objects.create(
        action=action,
        actor=actor,
        ip_address=ip_address or None,
        user_agent=user_agent,
        metadata=metadata or {},
    )
