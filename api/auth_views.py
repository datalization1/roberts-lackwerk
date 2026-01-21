from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from adminportal.utils.audit import log_audit
from main.utils.security import get_client_ip, is_rate_limited, register_failed_attempt, reset_rate_limit


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response({"detail": "Username und Passwort erforderlich"}, status=status.HTTP_400_BAD_REQUEST)
        ip = get_client_ip(request)
        rate_key = f"login:{ip}:{username}"
        if is_rate_limited(rate_key):
            return Response({"detail": "Zu viele Versuche. Bitte später erneut versuchen."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        user = authenticate(request, username=username, password=password)
        if user is None or not user.is_active:
            register_failed_attempt(rate_key)
            log_audit("api_login_failed", request=request, metadata={"username": username})
            return Response({"detail": "Ungültige Anmeldedaten oder keine Berechtigung"}, status=status.HTTP_401_UNAUTHORIZED)
        has_access = user.is_staff or user.groups.filter(name__in=["admin", "manager", "employee"]).exists()
        if not has_access:
            register_failed_attempt(rate_key)
            log_audit("api_login_denied", request=request, actor=user, metadata={"username": username})
            return Response({"detail": "Ungültige Anmeldedaten oder keine Berechtigung"}, status=status.HTTP_401_UNAUTHORIZED)
        reset_rate_limit(rate_key)
        login(request, user)
        log_audit("api_login_success", request=request, actor=user)
        return Response(
            {
                "username": user.username,
                "is_staff": user.is_staff,
                "groups": list(user.groups.values_list("name", flat=True)),
            }
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        log_audit("api_logout", request=request, actor=request.user)
        logout(request)
        return Response({"detail": "ok"})


class MeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        if user and user.is_authenticated:
            return Response(
                {
                    "username": user.username,
                    "is_staff": user.is_staff,
                    "groups": list(user.groups.values_list("name", flat=True)),
                }
            )
        return Response({"authenticated": False})
