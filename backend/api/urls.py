from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, add_patient, PredictAndClassifyView, UploadProfilePicture, PatientReportViewSet, PatientResultViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'reports', PatientReportViewSet)
router.register(r'results', PatientResultViewSet, basename='results')
urlpatterns = [
    path('', include(router.urls)),
    path('api/', include(router.urls)),
    path('api/add-patient/', add_patient, name='add-patient'),
    path('predict/', PredictAndClassifyView.as_view(), name='predict'),
    path('patients/<int:pk>/upload_picture/', UploadProfilePicture, name='upload-picture'),
]
urlpatterns += router.urls