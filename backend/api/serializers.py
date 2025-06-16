# api/serializers.py

from rest_framework import serializers
from .models import CustomUser, Patient, PatientResult
from djoser.serializers import UserSerializer as BaseUserSerializer
class PatientResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientResult
        fields = "__all__"
from .models import CustomUser, Patient, PatientResult, PatientReport

class PatientReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientReport
        fields = "__all__"

class PatientSerializer(serializers.ModelSerializer):
    results = PatientResultSerializer(many=True, read_only=True)
    reports = PatientReportSerializer(many=True, read_only=True)

    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['user']


class CustomUserSerializer(serializers.ModelSerializer):
    organization_logo = serializers.ImageField(use_url=True)
    class Meta(BaseUserSerializer.Meta):
        model = CustomUser
        fields = ['id', 'email', 'username', 'is_admin', 'is_organization', 'organization_type', 'organization_name', 'organization_address','organization_logo', 'phone']
