from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Book(models.Model):
    title = models.CharField("제목", max_length=200)
    description = models.TextField("설명")
    rating = models.DecimalField(
        "회원 리뷰 평점",
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    author = models.CharField("저자", max_length=200)

    cover_image = models.CharField(
        "표지 이미지", max_length=200, blank=True, editable=False
    )

    def __str__(self):
        return self.title
