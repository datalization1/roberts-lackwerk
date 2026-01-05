from rest_framework import permissions, views
from rest_framework.response import Response

from .pricing import EXTRA_PRICES, KM_PACKAGE_PRICES, INSURANCE_PRICES


class MetaOptionsView(views.APIView):
    """
    Liefert Konstanten für das Frontend (Extras, km-Pakete, Versicherungen).
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {
                "extras": EXTRA_PRICES,
                "km_packages": {
                    "prices": KM_PACKAGE_PRICES,
                    "descriptions": {
                        "100km": "100 km inklusive",
                        "200km": "200 km inklusive",
                        "unlimited": "Unbegrenzt Kilometer",
                    },
                },
                "insurance": {
                    "prices": INSURANCE_PRICES,
                    "descriptions": {
                        "basic": "Basis-Versicherung (SB 1000)",
                        "full": "Vollkasko (SB 500)",
                        "premium": "Premium (SB 0, Glas/Unterboden inkl.)",
                    },
                },
            }
        )
