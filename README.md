# ThRead · 취향은 한 권에서

SSAFY 관통 프로젝트 03의 반응형 도서 탐색 웹사이트입니다.

## GitHub Pages

이 저장소의 main 브랜치 루트에서 정적 화면을 배포합니다.
index.html은 06-main.html과 같은 메인 화면입니다.

- HTML / CSS / JavaScript / Bootstrap 5.3.3
- 12권 Carousel, 반응형 Navbar·Card, 장르 Flex/Grid, Modal, 도서 상세·지도
- 책장, 쓰레드 작성, 공감은 각 브라우저 localStorage에 저장
- 실시간 도서 검색은 기존 서버의 국립중앙도서관 API 프록시를 사용
- 추천 기능은 취향 태그 기반 미리보기

API 서버: https://thread-reading-pjt.nuttyharp16.chatgpt.site
공개 설정 assets/config.js에는 서버 주소만 들어 있습니다.
API 키와 .env, 과제 PDF, 개인 취업 서류는 이 저장소에 포함하지 않습니다.

## 화면 수정

HTML 또는 assets/site.css, assets/app.js를 수정해 main에 push하면 Pages가 갱신됩니다.
국립중앙도서관 API 키는 기존 호스팅 서버의 비밀 환경변수에만 보관합니다.
서버 코드와 비밀 설정은 GitHub Pages에서 실행하지 않습니다.

이미지·도서 표지·폰트는 과제 제공 자료를 사용했으며 권리는 각 권리자에게 있습니다.
Bootstrap / Bootstrap Icons의 MIT 라이선스는 assets/vendor에 보존했습니다.
