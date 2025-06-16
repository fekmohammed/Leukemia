from django.db import models
from django.contrib.auth.models import AbstractUser

# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    is_organization = models.BooleanField(default=False)

    ORGANIZATION_CHOICES = [
        ('hospital', 'Hospital'),
        ('clinic', 'Clinic'),
        ('lab', 'Lab'),
    ]
    organization_type = models.CharField(max_length=20, choices=ORGANIZATION_CHOICES, blank=True, null=True)
    organization_name = models.CharField(max_length=100, blank=True, null=True)
    organization_address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    organization_logo = models.ImageField(upload_to='organization/logos/', blank=True, null=True)  # ✅ new field

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Patient(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    fullname = models.CharField(max_length=100, default='N/A')
    phone = models.CharField(max_length=20, default='N/A')
    email = models.EmailField()
    gender = models.CharField(max_length=10, default='N/A')
    age = models.PositiveIntegerField(null=True, blank=True)
    address = models.CharField(max_length=255, default='N/A')
    blood_type = models.CharField(max_length=3, default='N/A')
    medical_conditions = models.TextField(blank=True)
    current_medications = models.TextField(blank=True)
    emergency_name = models.CharField(max_length=100, default='N/A')
    emergency_phone = models.CharField(max_length=20, default='N/A')
    profile_picture = models.ImageField(upload_to='patients/profile_pictures/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.fullname} (ID: {self.id})"


class PatientResult(models.Model):
    patient = models.ForeignKey("Patient", on_delete=models.CASCADE, related_name='results')
    image = models.ImageField(upload_to='patients/results/')
    annotated_image = models.ImageField(upload_to='patients/annotated/', null=True, blank=True, max_length=255)  # ✅ New field
    label = models.CharField(max_length=255, default='N/A')
    confidence = models.FloatField(default=0.0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result for {self.patient.fullname}: {self.label} ({self.confidence:.2f})"

class PatientReport(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=255)
    content = models.TextField()
    medication = models.TextField(default='N/A')
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.patient.fullname} on {self.date}"
