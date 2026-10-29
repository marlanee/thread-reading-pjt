from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator


class User(AbstractUser):
    gender = models.CharField(
        "성별",
        max_length=20,
        blank=True,
        choices=[
            ("female", "여성"),
            ("male", "남성"),
            ("other", "기타"),
            ("undisclosed", "선택 안 함"),
        ],
    )
    age = models.PositiveIntegerField(
        "나이", null=True, blank=True, validators=[MinValueValidator(1)]
    )
    weekly_reading_hours = models.PositiveIntegerField(
        "주간 평균 독서 시간", null=True, blank=True, validators=[MinValueValidator(1)]
    )
    annual_reading_count = models.PositiveIntegerField(
        "연간 독서량", null=True, blank=True, validators=[MinValueValidator(1)]
    )
    interested_genres = models.CharField("관심 장르", max_length=600, blank=True)
