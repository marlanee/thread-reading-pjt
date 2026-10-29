"""제공된 PJT 01 도서 자료 일부를 로컬 시연용으로 불러온다."""

import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import transaction
from books.models import Book


class Command(BaseCommand):
    help = "제공 자료의 도서 30권을 추가합니다. 같은 제목과 저자는 건너뜁니다."

    @transaction.atomic
    def handle(self, *args, **options):
        path = Path(__file__).resolve().parents[2] / "data" / "sample_books.json"
        items = json.loads(path.read_text(encoding="utf-8"))
        created = 0
        for item in items:
            values = {
                key: item[key] for key in ("title", "author", "description", "rating")
            }
            Book(**values).full_clean()
            book, added = Book.objects.get_or_create(
                title=values["title"],
                author=values["author"],
                defaults={
                    "description": values["description"],
                    "rating": values["rating"],
                },
            )
            if not book.cover_image:
                book.cover_image = item.get("cover_image", "")
                book.save(update_fields=["cover_image"])
            created += added
        self.stdout.write(
            self.style.SUCCESS(f"{created}권 추가 / {len(items)-created}권 건너뜀")
        )
