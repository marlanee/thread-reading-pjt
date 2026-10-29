from django import forms
from django.contrib.auth.forms import (
    UserCreationForm,
    UserChangeForm,
    AuthenticationForm,
    PasswordChangeForm,
)
from .models import User

GENRES = [
    (x, x)
    for x in [
        "소설",
        "시",
        "에세이",
        "인문",
        "역사",
        "과학",
        "경제",
        "예술",
        "자기계발",
        "기타",
    ]
]
FIELDS = [
    "username",
    "email",
    "last_name",
    "first_name",
    "gender",
    "age",
    "weekly_reading_hours",
    "annual_reading_count",
    "interested_genres",
]
LABELS = {
    "username": "아이디",
    "email": "이메일",
    "last_name": "성",
    "first_name": "이름",
}


class StyledFormMixin:
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if not isinstance(field.widget, forms.CheckboxSelectMultiple):
                field.widget.attrs["class"] = (
                    "form-select"
                    if isinstance(field.widget, forms.Select)
                    else "form-control"
                )


class LoginForm(StyledFormMixin, AuthenticationForm):
    pass


class ChangePasswordForm(StyledFormMixin, PasswordChangeForm):
    pass


class GenreMixin(StyledFormMixin):
    interested_genres = forms.MultipleChoiceField(
        label="관심 장르",
        choices=GENRES,
        widget=forms.CheckboxSelectMultiple,
        required=False,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.initial["interested_genres"] = (
                self.instance.interested_genres.split(",")
                if self.instance.interested_genres
                else []
            )
        for name, field in self.fields.items():
            if name.startswith("password") and name != "password":
                field.label = {
                    "password1": "비밀번호",
                    "password2": "비밀번호 확인",
                }.get(name, field.label)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.interested_genres = ",".join(self.cleaned_data["interested_genres"])
        if commit:
            user.save()
            self.save_m2m()
        return user


class CustomUserCreationForm(GenreMixin, UserCreationForm):
    interested_genres = GenreMixin.interested_genres

    class Meta(UserCreationForm.Meta):
        model = User
        fields = FIELDS
        labels = LABELS


class CustomUserChangeForm(GenreMixin, UserChangeForm):
    password = None
    interested_genres = GenreMixin.interested_genres

    class Meta(UserChangeForm.Meta):
        model = User
        fields = FIELDS
        labels = LABELS
