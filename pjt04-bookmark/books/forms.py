from django import forms
from .models import Book


class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ["title", "description", "rating", "author"]
        help_texts = {"rating": "0~5 사이의 평점을 소수점 한 자리까지 입력하세요."}
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control"}),
            "author": forms.TextInput(attrs={"class": "form-control"}),
            "description": forms.Textarea(attrs={"rows": 6, "class": "form-control"}),
            "rating": forms.NumberInput(
                attrs={"min": 0, "max": 5, "step": "0.1", "class": "form-control"}
            ),
        }
