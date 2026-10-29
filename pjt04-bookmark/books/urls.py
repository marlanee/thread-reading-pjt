from django.urls import path
from . import views

app_name = "books"
urlpatterns = [
    path("", views.index, name="index"),
    path("books/create/", views.create, name="create"),
    path("books/<int:pk>/", views.detail, name="detail"),
    path("books/<int:pk>/update/", views.update, name="update"),
    path("books/<int:pk>/delete/", views.delete, name="delete"),
]
