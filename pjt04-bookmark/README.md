# 책갈피 · Django 인증 및 도서 CRUD

SSAFY PJT 04의 포트폴리오 공개본입니다. [과정·검증·역할 및 이력서용 요약](../docs/projects/2026-10-29-bookmark.md)을 함께 확인하세요.

도서 정보를 기록하고 관리하는 Django 웹 애플리케이션입니다. 회원 인증과 도서 CRUD를 구현하고, 사용자 독서 정보 및 개인 프로필을 추가했습니다.

- 프로젝트: `mypjt` / 앱: `accounts`, `books`
- 검증 환경: Windows, **Python 3.11.9 / Django 5.2.6 / Bootstrap 5.3.3 / SQLite**

## 시작하기

저장소를 내려받은 후 프로젝트 루트(`manage.py`가 있는 위치)에서 실행합니다.

### Windows PowerShell

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_books
.\.venv\Scripts\python.exe manage.py runserver
```

### macOS / Linux

```bash
python3.11 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_books
.venv/bin/python manage.py runserver
```

브라우저에서 **http://127.0.0.1:8000/** 에 접속합니다. 회원가입을 하면 자동으로 로그인되며 도서 등록·수정·삭제와 프로필 기능을 사용할 수 있습니다. 관리자 계정이 필요한 경우 `python manage.py createsuperuser`를 실행합니다.

`seed_books`는 제공된 PJT 01 자료에서 추출한 도서 30권을 추가하는 선택 명령입니다. 여러 번 실행해도 중복을 추가하거나 기존 제목·저자·소개·평점을 덮어쓰지 않습니다. 표지가 비어 있는 제공 도서에는 표지 경로만 보충합니다. 빈 DB에서 시작하려면 이 명령을 생략하세요. DB 파일이나 미리 만든 사용자 계정은 제출하지 않습니다. Bootstrap·Pretendard 글꼴·도서 표지를 프로젝트 안에 포함했으므로 설치 이후 화면 스타일에 인터넷 연결은 필요하지 않습니다.

## 주요 기능

| 기능 | 동작 |
|---|---|
| 로그인·회원가입 | Django 인증 폼으로 검증, 회원가입 후 자동 로그인 |
| 로그아웃·탈퇴 | 로그인 사용자에게 POST 요청만 허용, 처리 후 홈으로 이동 |
| 회원정보 수정 | 현재 사용자 데이터만 수정, 관리자 권한 필드를 폼에서 제외 |
| 비밀번호 변경 | 기존 비밀번호 확인, 새 비밀번호 검증, 변경 후 로그인 유지 |
| 도서 목록·상세 | 비로그인 사용자도 전체 도서와 상세 내용을 조회 |
| 도서 등록·수정·삭제 | 로그인 사용자만 가능, 제목·저자·설명 필수, 평점 0~5 |
| 독서 프로필 | 성별·나이·주간 독서 시간·연간 독서량·복수 관심 장르 저장 |
| 오류 및 처리 알림 | 폼 입력 오류와 생성·수정·삭제 완료 메시지 표시 |

명세의 로그인 사용자 기준에 따라 로그인한 모든 회원이 도서를 수정·삭제할 수 있습니다. 작성자별 소유권 제한은 이번 명세에 포함되지 않습니다. 나이·독서 시간·독서량은 입력할 경우 1 이상의 정수이며, 미입력도 허용합니다.

## 요구사항과 실행 결과

- [요구사항별 구현 및 검증표](docs/requirements.md)
- [실행 화면과 캡처 목록](screenshots/README.md)
- [시연 데이터 출처와 변환 방법](books/data/README.md)

![로그인 화면](screenshots/10-login.png)
![도서 상세 화면](screenshots/04-book-detail.png)

## 검증 방법

가상환경의 Python으로 아래 명령을 실행합니다.

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Python 3.11.9의 새 가상환경에서 **20개 테스트 통과**, 시스템 검사 오류 없음, 추가 마이그레이션 없음으로 확인했습니다. 별도의 빈 데이터베이스에서도 마이그레이션 및 도서 로드 재실행을 확인했습니다.

테스트 범위: 인증·CRUD 정상 흐름, 잘못된 로그인·비밀번호·평점·프로필 숫자, 빈 입력, 중복 아이디, 권한 상승 시도, 비로그인 변경 요청, CSRF 토큰 없는 탈퇴, 지원하지 않는 메서드, 없는 도서의 404, 관심 장르 저장/초기값, 비밀번호 변경 후 세션 유지, 도서 초기 데이터 중복 방지입니다.

Chrome 브라우저에서도 회원가입 → 도서 등록·수정·삭제 → 회원정보 수정 → 비밀번호 변경 → 로그아웃 → 새 비밀번호 로그인 → 탈퇴까지 실행했습니다. 데스크톱(1440px)과 모바일(390px) 화면을 확인하고 캡처했습니다.

## 화면 디자인

20~30대 독서 사용자를 고려하여 옅은 라벤더 배경, 남색 메인 영역, 보라색 버튼을 사용했습니다. 한글 Pretendard 글꼴, 일관된 본문 간격, 책 표지 카드와 반응형 폼을 적용했습니다. 제목·저자 검색과 검색 결과가 없는 상태도 제공합니다. 긴 제목은 목록에서 두 줄로 정리하고 상세 화면에서는 전체를 확인할 수 있습니다.

## 학습 내용

- `AbstractUser`를 상속한 사용자 모델은 첫 마이그레이션 전에 `AUTH_USER_MODEL`로 지정해야 합니다.
- `ModelForm`으로 입력 형식과 모델 제약을 검증하고, 검증에 실패한 경우 사용자의 입력과 오류를 함께 표시했습니다.
- 화면에서 메뉴를 숨기는 것에 더해 서버의 `login_required`와 HTTP 메서드 제한이 필요합니다.
- 비밀번호 변경 후 `update_session_auth_hash`를 호출해 기존 로그인 세션을 유지했습니다.
- 관심 장르는 폼에서 리스트로 받고 DB에는 쉼표 문자열로 저장하며, 수정 화면에서는 다시 리스트로 변환했습니다.
- 사용자 정보 수정 시 허용 필드만 지정하여 `is_staff`와 `is_superuser`를 수정하지 못하도록 했습니다.

## 개발 회고

정상적인 입력으로 기능을 실행하는 것만으로는 검증이 충분하지 않았습니다. 빈 입력, 잘못된 숫자, 인증되지 않은 변경 요청과 같은 실패 상황을 함께 검사하면서 폼과 뷰의 역할을 구분할 수 있었습니다. 처리 후 메시지를 추가해 사용자가 저장·삭제 결과를 확인할 수 있게 했고, 로컬 Bootstrap과 초기 데이터 명령을 포함해 다른 환경에서도 시연하기 쉽게 정리했습니다.

## 범위 및 사용 자료

- 필수 F401~F416 및 NF401~NF402, 선택 F418·F419 구현.
- 선택 F417(위키피디아·생성형 AI API 기반 작가 정보 생성)은 미구현입니다. API 키가 필요하지 않습니다.
- 시연 데이터는 교육용으로 제공된 알라딘 도서 자료를 사용했습니다. 출처 URL 및 평점 변환은 `books/data/`에 기록했습니다. 스크린샷의 임시 검증 기록은 화면 흐름 검증을 위해 작성하고 검증 후 삭제했습니다.
- Pretendard 1.3.9(SIL OFL): `static/fonts/LICENSE` 포함.
- Bootstrap 5.3.3(MIT): `static/vendor/BOOTSTRAP-LICENSE` 포함.
- Django 공식 문서의 인증, ModelForm, 테스트 클라이언트 구조를 참고했습니다.
- 코드 작성과 검증 정리에 생성형 AI의 도움을 사용했습니다.
- 현재 설정은 로컬 교육·평가용입니다. 외부 운영 배포를 위한 SECRET_KEY, DEBUG, HTTPS 등의 설정은 별도 구성이 필요합니다.
