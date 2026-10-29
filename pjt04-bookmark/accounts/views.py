from django.contrib import messages
from django.contrib.auth import (
    login as auth_login,
    logout as auth_logout,
    update_session_auth_hash,
)
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods, require_POST, require_GET
from .forms import (
    CustomUserCreationForm,
    CustomUserChangeForm,
    LoginForm,
    ChangePasswordForm,
)


@require_http_methods(["GET", "POST"])
def login(request):
    if request.user.is_authenticated:
        return redirect("books:index")
    form = LoginForm(request, data=request.POST if request.method == "POST" else None)
    if request.method == "POST" and form.is_valid():
        auth_login(request, form.get_user())
        return redirect("books:index")
    return render(request, "accounts/form.html", {"form": form, "title": "로그인"})


@require_POST
@login_required
def logout(request):
    auth_logout(request)
    messages.success(request, "로그아웃했습니다.")
    return redirect("books:index")


@require_http_methods(["GET", "POST"])
def signup(request):
    if request.user.is_authenticated:
        return redirect("books:index")
    form = CustomUserCreationForm(request.POST if request.method == "POST" else None)
    if request.method == "POST" and form.is_valid():
        auth_login(request, form.save())
        messages.success(request, "회원가입이 완료되었습니다.")
        return redirect("books:index")
    return render(request, "accounts/form.html", {"form": form, "title": "회원가입"})


@require_http_methods(["GET", "POST"])
@login_required
def update(request):
    form = CustomUserChangeForm(
        request.POST if request.method == "POST" else None, instance=request.user
    )
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "회원정보를 수정했습니다.")
        return redirect("books:index")
    return render(
        request, "accounts/form.html", {"form": form, "title": "회원정보 수정"}
    )


@require_POST
@login_required
def delete(request):
    request.user.delete()
    auth_logout(request)
    messages.success(request, "회원탈퇴가 완료되었습니다.")
    return redirect("books:index")


@require_http_methods(["GET", "POST"])
@login_required
def change_password(request):
    form = ChangePasswordForm(
        request.user, request.POST if request.method == "POST" else None
    )
    if request.method == "POST" and form.is_valid():
        user = form.save()
        update_session_auth_hash(request, user)
        messages.success(request, "비밀번호를 변경했습니다.")
        return redirect("books:index")
    return render(
        request, "accounts/form.html", {"form": form, "title": "비밀번호 변경"}
    )


@require_GET
@login_required
def profile(request):
    return render(request, "accounts/profile.html")
