from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response


def add_status_actions(field_name="status", transitions=None):
    """
    Decorator: adds action endpoints for status transitions.
    Usage: @add_status_actions(field_name="status", transitions={...})
    """
    transitions = transitions or {}

    def decorator(viewset_cls):
        for new_status, allowed_from in transitions.items():
            def make_action(target_status, allowed):
                @action(detail=True, methods=["post"])
                def _action(self, request, pk=None):
                    if not request.user or not request.user.is_staff:
                        return Response({"detail": "Nur Mitarbeiter dürfen Status ändern."},
                                        status=status.HTTP_403_FORBIDDEN)
                    obj = self.get_object()
                    current = getattr(obj, field_name)
                    if allowed and current not in allowed:
                        return Response({"detail": f"Statuswechsel von {current} nach {target_status} nicht erlaubt."},
                                        status=status.HTTP_400_BAD_REQUEST)
                    setattr(obj, field_name, target_status)
                    obj.save(update_fields=[field_name])
                    serializer = self.get_serializer(obj)
                    return Response(serializer.data)
                _action.__name__ = target_status  # unique per loop
                return _action

            action_fn = make_action(new_status, allowed_from)
            setattr(viewset_cls, new_status, action_fn)
        return viewset_cls

    return decorator
