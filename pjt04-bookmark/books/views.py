from django.db.models import Q
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from .forms import BookForm
from .models import Book


@require_GET
def index(request):
    query = request.GET.get("q", "").strip()[:100]
    books = Book.objects.order_by("-pk")
    if query:
        books = books.filter(Q(title__icontains=query) | Q(author__icontains=query))
    featured = Book.objects.exclude(cover_image="").order_by("pk")[:3]
    return render(
        request,
        "books/index.html",
        {"books": books, "query": query, "featured_books": featured},
    )


@require_http_methods(["GET", "POST"])
@login_required
def create(request):
    form = BookForm(request.POST if request.method == "POST" else None)
    if request.method == "POST" and form.is_valid():
        book = form.save()
        messages.success(request, "도서를 등록했습니다.")
        return redirect("books:detail", book.pk)
    return render(request, "books/form.html", {"form": form, "title": "도서 등록"})


@require_GET
def detail(request, pk):
    return render(
        request, "books/detail.html", {"book": get_object_or_404(Book, pk=pk)}
    )


@require_http_methods(["GET", "POST"])
@login_required
def update(request, pk):
    book = get_object_or_404(Book, pk=pk)
    form = BookForm(request.POST if request.method == "POST" else None, instance=book)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "도서를 수정했습니다.")
        return redirect("books:detail", book.pk)
    return render(request, "books/form.html", {"form": form, "title": "도서 수정"})


@require_POST
@login_required
def delete(request, pk):
    get_object_or_404(Book, pk=pk).delete()
    messages.success(request, "도서를 삭제했습니다.")
    return redirect("books:index")
