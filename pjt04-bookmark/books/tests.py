from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from books.models import Book


class ProjectTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="reader", password="StrongPass123!"
        )
        self.book = Book.objects.create(
            title="처음 책", author="작가", description="소개", rating=4
        )

    def test_public_and_access(self):
        self.assertContains(self.client.get(reverse("books:index")), "처음 책")
        self.assertContains(
            self.client.get(reverse("books:detail", args=[self.book.pk])), "작가"
        )
        for name, args in [
            ("books:create", []),
            ("books:update", [self.book.pk]),
            ("accounts:profile", []),
        ]:
            self.assertEqual(self.client.get(reverse(name, args=args)).status_code, 302)
        for name, args in [
            ("books:delete", [self.book.pk]),
            ("accounts:logout", []),
            ("accounts:delete", []),
        ]:
            self.assertEqual(self.client.get(reverse(name, args=args)).status_code, 405)

    def test_book_crud_and_validation(self):
        self.client.force_login(self.user)
        data = {
            "title": "새 책",
            "author": "저자",
            "description": "내용",
            "rating": "4.5",
        }
        response = self.client.post(reverse("books:create"), data)
        book = Book.objects.get(title="새 책")
        self.assertRedirects(response, reverse("books:detail", args=[book.pk]))
        data["rating"] = "6"
        self.assertEqual(
            self.client.post(reverse("books:update", args=[book.pk]), data).status_code,
            200,
        )
        book.refresh_from_db()
        self.assertEqual(str(book.rating), "4.5")
        data["rating"] = "3"
        data["title"] = "수정"
        self.client.post(reverse("books:update", args=[book.pk]), data)
        book.refresh_from_db()
        self.assertEqual(book.title, "수정")
        self.client.post(reverse("books:delete", args=[book.pk]))
        self.assertFalse(Book.objects.filter(pk=book.pk).exists())

    def test_signup_profile_update_password_delete(self):
        data = {
            "username": "newreader",
            "password1": "StrongPass456!",
            "password2": "StrongPass456!",
            "interested_genres": ["소설", "과학"],
            "age": 25,
        }
        response = self.client.post(reverse("accounts:signup"), data)
        self.assertRedirects(response, reverse("books:index"))
        user = get_user_model().objects.get(username="newreader")
        self.assertEqual(user.interested_genres, "소설,과학")
        self.assertContains(self.client.get(reverse("accounts:profile")), "소설,과학")
        data = {
            "username": "newreader",
            "email": "reader@example.com",
            "interested_genres": ["역사"],
            "age": 30,
        }
        self.client.post(reverse("accounts:update"), data)
        user.refresh_from_db()
        self.assertEqual(user.interested_genres, "역사")
        response = self.client.post(
            reverse("accounts:change_password"),
            {
                "old_password": "StrongPass456!",
                "new_password1": "AnotherStrong789!",
                "new_password2": "AnotherStrong789!",
            },
        )
        self.assertRedirects(response, reverse("books:index"))
        self.assertEqual(self.client.get(reverse("accounts:profile")).status_code, 200)
        self.client.post(reverse("accounts:delete"))
        self.assertFalse(get_user_model().objects.filter(pk=user.pk).exists())

    def test_login_logout(self):
        response = self.client.post(
            reverse("accounts:login"), {"username": "reader", "password": "wrong"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("_auth_user_id", self.client.session)
        self.client.post(
            reverse("accounts:login"),
            {"username": "reader", "password": "StrongPass123!"},
        )
        self.assertIn("_auth_user_id", self.client.session)
        self.client.post(reverse("accounts:logout"))
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_anonymous_post_cannot_change_books(self):
        count = Book.objects.count()
        self.client.post(reverse("books:create"), {"title": "forbidden"})
        self.client.post(
            reverse("books:update", args=[self.book.pk]), {"title": "forbidden"}
        )
        self.client.post(reverse("books:delete", args=[self.book.pk]))
        self.book.refresh_from_db()
        self.assertEqual(self.book.title, "처음 책")
        self.assertEqual(Book.objects.count(), count)

    def test_rating_boundaries_and_blank_fields(self):
        from .forms import BookForm

        for value, valid in [
            ("0", True),
            ("5", True),
            ("-0.1", False),
            ("5.1", False),
            ("3.45", False),
            ("NaN", False),
        ]:
            with self.subTest(value=value):
                form = BookForm(
                    {
                        "title": "책",
                        "author": "작가",
                        "description": "소개",
                        "rating": value,
                    }
                )
                self.assertEqual(form.is_valid(), valid)
        self.assertFalse(
            BookForm(
                {"title": " ", "author": " ", "description": " ", "rating": "2"}
            ).is_valid()
        )

    def test_missing_book_returns_404(self):
        self.client.force_login(self.user)
        self.assertEqual(
            self.client.get(reverse("books:detail", args=[99999])).status_code, 404
        )
        self.assertEqual(
            self.client.get(reverse("books:update", args=[99999])).status_code, 404
        )
        self.assertEqual(
            self.client.post(reverse("books:delete", args=[99999])).status_code, 404
        )

    def test_unsupported_methods_return_405(self):
        self.client.force_login(self.user)
        endpoints = [
            ("books:index", []),
            ("books:detail", [self.book.pk]),
            ("books:create", []),
            ("books:update", [self.book.pk]),
            ("books:delete", [self.book.pk]),
            ("accounts:login", []),
            ("accounts:signup", []),
            ("accounts:update", []),
            ("accounts:change_password", []),
            ("accounts:delete", []),
            ("accounts:logout", []),
            ("accounts:profile", []),
        ]
        for name, args in endpoints:
            with self.subTest(name=name):
                self.assertEqual(
                    self.client.put(reverse(name, args=args)).status_code, 405
                )

    def test_seed_is_repeatable_and_preserves_existing_edits(self):
        from django.core.management import call_command
        from io import StringIO

        call_command("seed_books", stdout=StringIO())
        count = Book.objects.count()
        book = Book.objects.exclude(pk=self.book.pk).first()
        book.description = "직접 수정한 소개"
        book.save()
        call_command("seed_books", stdout=StringIO())
        self.assertEqual(Book.objects.count(), count)
        book.refresh_from_db()
        self.assertEqual(book.description, "직접 수정한 소개")

    def test_search_by_title_and_author_and_no_results(self):
        for query in ["처음", "작가"]:
            response = self.client.get(reverse("books:index"), {"q": query})
            self.assertContains(response, "처음 책")
        response = self.client.get(reverse("books:index"), {"q": "존재하지않는제목"})
        self.assertContains(response, "검색 결과가 없어요")
        self.assertNotContains(response, "처음 책")

    def test_cover_is_not_editable_through_book_form(self):
        self.client.force_login(self.user)
        self.client.post(
            reverse("books:update", args=[self.book.pk]),
            {
                "title": "처음 책",
                "author": "작가",
                "description": "소개",
                "rating": "4",
                "cover_image": "https://example.com/untrusted.jpg",
            },
        )
        self.book.refresh_from_db()
        self.assertEqual(self.book.cover_image, "")
