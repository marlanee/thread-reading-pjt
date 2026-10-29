from django.contrib.auth import get_user_model
from django.test import TestCase, Client
from django.urls import reverse
from .forms import CustomUserCreationForm, CustomUserChangeForm


class AccountValidationTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="member",
            password="ValidPassword123!",
            interested_genres="소설,과학",
        )

    def test_empty_signup_displays_errors_and_saves_nothing(self):
        response = self.client.post(reverse("accounts:signup"), {})
        self.assertContains(response, "입력한 내용을 확인")
        self.assertEqual(get_user_model().objects.count(), 1)

    def test_password_mismatch_and_duplicate_username(self):
        form = CustomUserCreationForm(
            {
                "username": "member",
                "password1": "ValidPassword123!",
                "password2": "different",
            }
        )
        self.assertFalse(form.is_valid())
        self.assertIn("username", form.errors)
        self.assertIn("password2", form.errors)

    def test_positive_integer_profile_fields(self):
        for field in ["age", "weekly_reading_hours", "annual_reading_count"]:
            for value in ["0", "-1", "1.5"]:
                with self.subTest(field=field, value=value):
                    form = CustomUserChangeForm(
                        {"username": "member", field: value}, instance=self.user
                    )
                    self.assertFalse(form.is_valid())
                    self.assertIn(field, form.errors)

    def test_genre_initial_value_and_empty_selection(self):
        self.assertEqual(
            CustomUserChangeForm(instance=self.user).initial["interested_genres"],
            ["소설", "과학"],
        )
        self.client.force_login(self.user)
        self.client.post(reverse("accounts:update"), {"username": "member"})
        self.user.refresh_from_db()
        self.assertEqual(self.user.interested_genres, "")

    def test_update_cannot_grant_privileges(self):
        self.client.force_login(self.user)
        self.client.post(
            reverse("accounts:update"),
            {"username": "member", "is_staff": "on", "is_superuser": "on"},
        )
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)

    def test_wrong_old_password_preserves_password_and_session(self):
        self.client.force_login(self.user)
        response = self.client.post(
            reverse("accounts:change_password"),
            {
                "old_password": "wrong",
                "new_password1": "OtherValid123!",
                "new_password2": "OtherValid123!",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("ValidPassword123!"))
        self.assertIn("_auth_user_id", self.client.session)

    def test_authenticated_user_skips_login_and_signup(self):
        self.client.force_login(self.user)
        for name in ["accounts:login", "accounts:signup"]:
            self.assertRedirects(self.client.get(reverse(name)), reverse("books:index"))

    def test_anonymous_cannot_modify_account(self):
        for name in [
            "accounts:update",
            "accounts:change_password",
            "accounts:delete",
            "accounts:logout",
        ]:
            self.assertEqual(self.client.post(reverse(name), {}).status_code, 302)
        self.assertTrue(get_user_model().objects.filter(pk=self.user.pk).exists())

    def test_csrf_token_required(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.user)
        self.assertEqual(client.post(reverse("accounts:delete")).status_code, 403)
        self.assertTrue(get_user_model().objects.filter(pk=self.user.pk).exists())
