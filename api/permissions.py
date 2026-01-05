from rest_framework import permissions


class AdminOrReadOnly(permissions.BasePermission):
    """Allow safe methods to everyone, write operations only to staff."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.groups.filter(name__in=["admin", "manager"]).exists()
            )
        )


class StaffOrPostOnly(permissions.BasePermission):
    """
    Allow creating resources without auth (public forms),
    but restrict reads/updates/deletes to staff.
    """

    def has_permission(self, request, view):
        if request.method == "POST":
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.groups.filter(name__in=["admin", "manager", "employee"]).exists()
            )
        )
