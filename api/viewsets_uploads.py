from uuid import uuid4

from django.core.files.storage import default_storage
from django.utils import timezone
from rest_framework import permissions, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from main.models import DamageReport, DamagePhoto


class DamagePhotoUploadView(views.APIView):
    """
    Ermöglicht Upload eines Schadenfotos zu einem bestehenden DamageReport.
    POST multipart: { image: <file> }
    """

    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            report = DamageReport.objects.get(pk=pk)
        except DamageReport.DoesNotExist:
            return Response({"detail": "Report nicht gefunden."}, status=status.HTTP_404_NOT_FOUND)

        files = request.FILES.getlist("images") or request.FILES.getlist("image")
        if not files:
            single = request.FILES.get("image")
            files = [single] if single else []
        if not files:
            return Response({"detail": "Keine Bilddateien übermittelt."}, status=status.HTTP_400_BAD_REQUEST)

        max_files = 5
        if len(files) > max_files:
            return Response({"detail": f"Maximal {max_files} Dateien pro Anfrage erlaubt."}, status=status.HTTP_400_BAD_REQUEST)

        max_size_mb = 5
        allowed_types = {"image/jpeg", "image/png", "image/webp"}
        created = []

        for file_obj in files:
            if file_obj.size > max_size_mb * 1024 * 1024:
                return Response({"detail": f"{file_obj.name}: Datei ist zu groß (max. {max_size_mb} MB)."}, status=status.HTTP_400_BAD_REQUEST)
            if file_obj.content_type not in allowed_types:
                return Response({"detail": f"{file_obj.name}: Nur JPEG, PNG oder WEBP erlaubt."}, status=status.HTTP_400_BAD_REQUEST)

            photo = DamagePhoto.objects.create(report=report, image=file_obj)
            if photo.image:
                photo.file_url = photo.image.url
                photo.save(update_fields=["file_url"])
            created.append(
                {
                    "id": photo.id,
                    "url": photo.file_url or (photo.image.url if photo.image else ""),
                    "uploaded_at": photo.uploaded_at,
                }
            )

        response_data = {"uploaded": created}
        if len(created) == 1:
            response_data.update(created[0])
        return Response(response_data, status=status.HTTP_201_CREATED)


class DamageDocumentUploadView(views.APIView):
    """
    Upload von Dokumenten zu einem bestehenden DamageReport.
    POST multipart: { documents: <file>, ... }
    """

    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            report = DamageReport.objects.get(pk=pk)
        except DamageReport.DoesNotExist:
            return Response({"detail": "Report nicht gefunden."}, status=status.HTTP_404_NOT_FOUND)

        files = request.FILES.getlist("documents") or request.FILES.getlist("document")
        if not files:
            single = request.FILES.get("document")
            files = [single] if single else []
        if not files:
            return Response({"detail": "Keine Dateien übermittelt."}, status=status.HTTP_400_BAD_REQUEST)

        max_files = 5
        if len(files) > max_files:
            return Response({"detail": f"Maximal {max_files} Dateien pro Anfrage erlaubt."}, status=status.HTTP_400_BAD_REQUEST)

        max_size_mb = 8
        allowed_types = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
        uploaded = []
        now = timezone.now()
        date_path = now.strftime("%Y/%m/%d")

        for file_obj in files:
            if file_obj.size > max_size_mb * 1024 * 1024:
                return Response({"detail": f"{file_obj.name}: Datei ist zu groß (max. {max_size_mb} MB)."}, status=status.HTTP_400_BAD_REQUEST)
            if file_obj.content_type not in allowed_types:
                return Response({"detail": f"{file_obj.name}: Nur PDF, JPEG, PNG oder WEBP erlaubt."}, status=status.HTTP_400_BAD_REQUEST)

            safe_name = f"{uuid4().hex}_{file_obj.name}"
            storage_path = f"damage_docs/{date_path}/{safe_name}"
            stored_path = default_storage.save(storage_path, file_obj)
            file_url = default_storage.url(stored_path)
            uploaded.append({"name": file_obj.name, "url": file_url})

        report.documents = list(report.documents or []) + [item["url"] for item in uploaded]
        report.save(update_fields=["documents"])

        return Response({"uploaded": uploaded, "documents": report.documents}, status=status.HTTP_201_CREATED)
