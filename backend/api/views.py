from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated

from django.core.files.base import ContentFile
from django.conf import settings

from .models import Patient, PatientResult
from .serializers import PatientSerializer, PatientResultSerializer
from .mobilenet_classifier import classify_roi

import os
import cv2
import tempfile
import tensorflow as tf
from ultralytics import YOLO

# === Upload profile picture ===
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def UploadProfilePicture(request, pk):
    try:
        patient = Patient.objects.get(pk=pk)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)

    if 'profile_picture' in request.FILES:
        patient.profile_picture = request.FILES['profile_picture']
        patient.save()
        return Response(PatientSerializer(patient).data, status=status.HTTP_200_OK)

    return Response({'error': 'No profile picture provided'}, status=status.HTTP_400_BAD_REQUEST)

from .models import PatientReport
from .serializers import PatientReportSerializer

class PatientReportViewSet(viewsets.ModelViewSet):
    queryset = PatientReport.objects.all()
    serializer_class = PatientReportSerializer
    
# === PatientViewSet ===
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Patient.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from .models import PatientResult
from .serializers import PatientResultSerializer

class PatientResultViewSet(viewsets.ModelViewSet):
    queryset = PatientResult.objects.all()
    serializer_class = PatientResultSerializer

# === Add Patient API ===
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_patient(request):
    data = request.data.copy()
    data['user'] = request.user.id

    serializer = PatientSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Patient created successfully', 'patient': serializer.data}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# === YOLO & Path Config ===
CONF_THRESHOLD = 0.9
YOLO_MODEL_PATH = os.path.join(settings.BASE_DIR, "models/best.pt")
ROI_DIR = os.path.join(settings.MEDIA_ROOT, "roi")
ANNOTATED_DIR = os.path.join(settings.MEDIA_ROOT, "annotated")
os.makedirs(ROI_DIR, exist_ok=True)
os.makedirs(ANNOTATED_DIR, exist_ok=True)


# === Predict & Classify View ===
class PredictAndClassifyView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("image")
        patient_id = request.data.get("patient_id")

        if not uploaded_file or not patient_id:
            return Response({"error": "Image and patient_id are required."}, status=400)

        try:
            patient = Patient.objects.get(id=patient_id, user=request.user)
        except Patient.DoesNotExist:
            return Response({"error": "Invalid patient ID."}, status=404)

        original_name = os.path.splitext(uploaded_file.name)[0]
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
            temp_img_path = tmp.name

        img = cv2.imread(temp_img_path)
        img_annotated = img.copy()

        model = YOLO(YOLO_MODEL_PATH)
        result = model.predict(source=img, conf=CONF_THRESHOLD)[0]

        boxes = result.boxes.xyxy.cpu().numpy()
        classes = result.boxes.cls.cpu().numpy().astype(int)
        confidences = result.boxes.conf.cpu().numpy()

        output = []
        result_objects = []

        for i, (box, cls_id, conf) in enumerate(zip(boxes, classes, confidences)):
            x1, y1, x2, y2 = map(int, box)
            class_name = model.names[cls_id]

            # Crop ROI
            roi = img[y1:y2, x1:x2]
            roi_name = f"{original_name}_{i+1}.jpg"
            roi_path = os.path.join(ROI_DIR, roi_name)
            cv2.imwrite(roi_path, roi)

            # Classify ROI
            label, clf_conf = classify_roi(roi_path)

            # Save result
            with open(roi_path, "rb") as f:
                result_obj = PatientResult(
                    patient=patient,
                    label=label,
                    confidence=clf_conf
                )
                result_obj.image.save(roi_name, ContentFile(f.read()))
                result_obj.save()
                result_objects.append(result_obj)

            # Draw detection on annotated image
            cv2.rectangle(img_annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img_annotated, f"{label} ({clf_conf:.2f})", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            output.append({
                "filename": result_obj.image.url,
                "label": label,
                "confidence": clf_conf
            })

        # Save the full annotated image
        annotated_name = f"{original_name}_annotated.jpg"
        annotated_path = os.path.join(ANNOTATED_DIR, annotated_name)
        cv2.imwrite(annotated_path, img_annotated)

        # Save the annotated image only to the first result
        if result_objects:
            with open(annotated_path, "rb") as f:
                annotated_file = ContentFile(f.read())
                result_objects[0].annotated_image.save(annotated_name, annotated_file)
                result_objects[0].save()

        # Cleanup
        os.remove(temp_img_path)

        return Response({
            "results": output,
            "annotated_image": f"/media/annotated/{annotated_name}"
        }, status=200)
