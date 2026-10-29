# 명세 요구사항 점검

기준: 제공된 4회차 명세서의 F401~F419, NF401~NF402 및 산출물 요구사항. 필수 18개 구현, 선택 심화 3개 중 2개 구현. 다음 표의 구현 여부는 기능 검증 결과이며 채점 결과가 아닙니다.

| 번호 | 요구사항 | 상태 | 구현 근거 / 캡처 |
|---|---|---|---|
| F401 | 프로젝트·앱 및 공통 Navbar | 구현 | mypjt, accounts, books / 01, 06 |
| F402 | AbstractUser 기반 사용자 모델 | 구현 | accounts/models.py |
| F403 | 사용자 폼 | 구현 | accounts/forms.py |
| F404 | 제목·설명·평점·저자 Book 모델 | 구현 | books/models.py |
| F405 | BookForm ModelForm | 구현 | books/forms.py / 03, 21 |
| F406 | 로그인 검증 및 세션 생성 | 구현 | accounts/views.py login / 10, 11, 06 |
| F407 | POST 로그아웃 | 구현 | logout / 17 |
| F408 | 회원가입 및 자동 로그인 | 구현 | signup / 02, 12 |
| F409 | 현재 사용자 정보 수정 | 구현 | update / 08, 15 |
| F410 | POST 회원탈퇴 | 구현 | delete / 18 |
| F411 | 비밀번호 변경 및 세션 유지 | 구현 | change_password / 09, 16 |
| F412 | 전체 도서 목록 및 상세 링크 | 구현 | books/views.py index / 01, 06 |
| F413 | 로그인 사용자 도서 생성·검증 | 구현 | create / 03, 04, 21 |
| F414 | 도서 상세와 수정·삭제·목록 UI | 구현 | detail / 04 |
| F415 | 기존 값 표시 및 도서 수정 | 구현 | update / 05, 13 |
| F416 | 로그인 사용자 POST 도서 삭제 | 구현 | delete / 14 |
| F417 | 위키피디아 및 AI 작가 정보 | 미구현(선택) | 외부 API 미연동 |
| F418 | 사용자 추가 정보 및 복수 장르 | 구현(선택) | User, CustomUserCreationForm, CustomUserChangeForm / 02, 07, 08 |
| F419 | 개인 프로필 및 계정 관리 링크 | 구현(선택) | profile / 07 |
| NF401 | 변경에 대응 가능한 URL | 구현 | app_name, URL name, reverse 및 템플릿 url 태그 |
| NF402 | 허용 HTTP 메서드만 처리 | 구현 | require_GET, require_POST, require_http_methods 및 테스트 |

F418의 장르 문자열 변환은 공통 폼의 save()에 두어 회원가입과 정보 수정에서 같은 규칙을 사용합니다. GET 요청의 기존 장르는 폼 생성자에서 split하여 initial로 설정합니다.

## 제출 산출물

- 전체 소스와 마이그레이션, requirements.txt, .gitignore
- 실행 결과 화면 21장 및 screenshots/README.md
- 주요 기능·학습 내용·회고·실행 방법을 포함한 README.md
- 과제용 GitLab 프로젝트 04-pjt 제출 및 담당 강사 접근 권한 설정

## 검증 결과

Python 3.11.9 / Django 5.2.6에서 테스트 20개 통과. 새 DB 마이그레이션, seed_books 반복 실행, 지원하지 않는 HTTP 메서드 및 잘못된 인증/입력 검증을 확인했습니다. Chrome 실제 화면 흐름과 390px 모바일 화면을 확인했습니다.
