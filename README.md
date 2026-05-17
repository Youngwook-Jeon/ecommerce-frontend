# Ecomart — E-Commerce Frontend

**Next.js 15** 기반 이커머스 **스토어프론트·관리자(Admin) UI**입니다. 백엔드 API Gateway(`edge-service`)를 단일 진입점으로 사용하며, 세션·CSRF 쿠키를 포함한 인증 흐름과 **R2 Presigned URL** 이미지 업로드를 클라이언트에서 처리합니다.

> 백엔드(MSA)는 별도 저장소 [ecommerce-msa](https://github.com/Youngwook-Jeon/ecommerce-msa) 에 있습니다. 로컬에서는 Gateway가 이 앱(`:3000`)을 프록시하므로 **브라우저 접속은 `http://localhost:9000`** 을 기준으로 합니다.

---

## 프로젝트 하이라이트 & 핵심 구현 포인트

단순한 UI 구현을 넘어, **성능**·**인증 보안**·**백엔드 MSA와의 안정적인 연동**에 초점을 맞췄습니다.


| 영역       | 한 줄 요약                                    |
| -------- | ----------------------------------------- |
| BFF · 인증 | Gateway 단일 진입, SESSION·CSRF, JWT 브라우저 미노출 |
| 이미지 업로드  | Canvas 리사이즈 후 Presigned URL 병렬 PUT        |
| 타입 안전성   | Zod + React Hook Form, API 응답 런타임 검증      |
| 관리자 UX   | Radix/shadcn, TanStack Table 기반 대시보드      |


### 1. BFF 기반 안전한 인증 아키텍처

**문제**  
브라우저가 MSA API에 직접 호출하면 CORS 설정이 복잡해지고, JWT를 `localStorage` 등에 두면 XSS에 노출될 수 있습니다. Gateway OAuth2 흐름과도 맞추기 어렵습니다.

**적용**

- 모든 API 호출을 `**http://localhost:9000`(Gateway)** 로 통일 — Next.js는 Gateway 뒤 SPA로만 노출
- 브라우저는 **JWT를 직접 다루지 않음** — `SESSION_edge-service`, `XSRF-TOKEN` 쿠키만 사용
- `fetchWrapper`가 Server Component·Server Action에서 **세션·CSRF 쿠키를 forward**해 인증 상태 유지
- `AdminDashboardLayout`에서 `GET /authentication` + `ADMIN` 역할 검사 후 어드민 진입

### 2. 브라우저 리사이징 · Presigned URL 병렬 업로드

**문제**  
고해상도 이미지를 API 서버로 올리면 업로드 시간·메모리·타임아웃 부담이 크고, 백엔드와 스토리지 대역폭을 낭비합니다.

**적용**

- 업로드 전 `**resizeImageIfNeeded`(Canvas API)** 로 WebP/JPEG 압축·리사이징
- `presign` → `**putFileToPresignedUrl`**(쿠키 없이 외부 PUT) → `commit` 3단계 파이프라인
- `**mapConcurrent` / `forEachConcurrent**` 로 다중 파일 병렬 업로드
- 바이너리는 **Cloudflare R2로 직접 전송** — 애플리케이션 서버 경유 없음

### 3. End-to-End 타입 안전성

**문제**  
상품·옵션·카테고리 폼은 필드가 많고, API 응답 shape이 어긋나면 런타임에서만 오류가 드러나 디버깅이 어렵습니다.

**적용**

- **Zod + React Hook Form**으로 폼 입력·제출 데이터 검증
- `AuthUserInfoSchema` 등으로 **API 응답을 `safeParse`** — 잘못된 payload 조기 차단
- `services/`·`common/schemas/`에 DTO·스키마를 모아 **계층 간 계약을 명시**

### 4. 모던 UI/UX · 관리자 대시보드

**문제**  
카테고리·상품·옵션·Variant·이미지를 한 화면 흐름으로 다루려면 접근성·테이블 성능·복잡 폼 UX를 함께 고려해야 합니다.

**적용**

- **Radix UI + shadcn/ui** — 키보드·포커스 등 접근성(a11y) 기본 제공
- **TanStack Table** — 관리자 목록 정렬·페이지네이션·컬럼 정의
- **Route Group** `(home)` / `(dashboard)` 로 스토어프론트와 어드민 레이아웃 분리
- 상품 상세는 **탭(옵션·Variant·이미지)** ·드래그앤드롭(`react-dropzone`)으로 작업 단위 분리

---

## 기술 스택

- **Framework:** Next.js 15 (App Router), React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3, tailwind-merge, next-themes (다크 모드)
- **UI:** Radix UI, shadcn/ui 패턴 컴포넌트 (`components/ui`)
- **Forms / Table:** React Hook Form, Zod, TanStack Table
- **Upload:** react-dropzone, 클라이언트 이미지 리사이즈·병렬 업로드
- **Package manager:** [Bun](https://bun.sh) (빠른 의존성 설치 및 실행)

---

## 주요 화면


| 경로                               | 설명                          |
| -------------------------------- | --------------------------- |
| `/`                              | 홈 — Hero, Featured Products |
| `/profile`                       | 프로필                         |
| `/dashboard/admin`               | 관리자 대시보드 (ADMIN 전용)         |
| `/dashboard/admin/categories`    | 카테고리 CRUD                   |
| `/dashboard/admin/products`      | 상품·Variant·옵션·이미지 관리        |
| `/dashboard/admin/option-groups` | 글로벌 옵션 그룹·옵션 값 관리           |


---

## 저장소 구조

```
ecommerce-frontend/
├── src/
│   ├── app/                    # App Router 페이지·레이아웃
│   │   ├── (home)/             # 스토어프론트
│   │   └── (dashboard)/        # 대시보드·어드민
│   ├── modules/                # 기능별 UI (home, dashboard)
│   ├── services/               # productService, categoryService 등
│   ├── common/                 # fetchWrapper, authService, schemas
│   ├── components/ui/          # shadcn UI primitives
│   └── lib/                    # productImageUpload, utils
├── public/
├── package.json
└── bun.lock
```

---

## 사전 요구 사항


| 도구                    | 용도                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [Bun](https://bun.sh) | 의존성 설치·개발 서버                                                                                                           |
| 백엔드 인프라 + 서비스         | [ecommerce-msa](https://github.com/Youngwook-Jeon/ecommerce-msa) README 참고 (Docker, `edge-service`, `product-service`) |


---

## 로컬 실행

### 1. 백엔드 기동

[ecommerce-msa](https://github.com/Youngwook-Jeon/ecommerce-msa) 저장소에서 Docker 인프라·`edge-service`·`product-service` 를 실행합니다.

### 2. 프론트엔드

```bash
git clone https://github.com/Youngwook-Jeon/ecommerce-frontend.git
cd ecommerce-frontend
bun install
bun run dev
```

Next.js dev 서버는 `**http://localhost:3000**` 에 뜹니다.

### 3. 브라우저 접속

`**http://localhost:9000**` (Gateway가 SPA로 프록시)

직접 `:3000`만 열면 Gateway 세션·CSRF·OAuth 리다이렉트 흐름과 어긋날 수 있습니다.

### 4. 관리자 로그인

어드민 패널(`/dashboard/admin/**`)은 Keycloak 로그인 후 `ADMIN` 역할이 필요합니다.


| 항목   | 값                 |
| ---- | ----------------- |
| 이메일  | `lucas@lucas.com` |
| 비밀번호 | `password`        |


로그인은 Gateway(`:9000`)에서 진행합니다. 로그인 후 관리자 메뉴로 이동하세요.

---

## API 연동

모든 백엔드 통신은 src/common/services/fetchWrapper.ts를 거치며, 자동으로 API Gateway로 향합니다.

```
http://localhost:9000/api/v1/product_service/...
```

예시 (`productService.ts`):

- `GET api/v1/product_service/admin/queries/products` — 상품 목록
- `POST api/v1/product_service/admin/products/{id}/images/presign-upload` — 업로드 URL 발급
- `PUT` (presigned URL) — R2 직접 업로드
- `POST .../images/commit` — 업로드 확정

인증 상태 확인:

- `GET http://localhost:9000/authentication` → `fetchWrapper` + Zod `AuthUserInfoSchema`

CSRF 방어:

- fetchWrapper는 모든 Mutation(POST, PUT, PATCH, DELETE) 요청 시 쿠키에 있는 XSRF-TOKEN을 읽어 헤더(X-XSRF-TOKEN)에 자동으로 삽입합니다.

---

## 스크립트

```bash
bun dev      # 개발 서버 (port 3000)
bun run build
bun run start
bun run lint
```

---

## 진행 현황 / 로드맵

- 스토어프론트 홈·네비게이션 레이아웃
- Gateway 세션·CSRF 연동 (`fetchWrapper`)
- 관리자 — 카테고리 / 상품 / 글로벌 옵션 그룹 CRUD
- 상품 Variant·옵션 그룹·옵션 값 UI
- Presigned URL 기반 상품·옵션 값 이미지 업로드
- 스토어프론트 공개 상품 API 연동 (백엔드 `public/products` 완성 후)
- 장바구니·주문·결제 UI

---

## 트러블슈팅


| 증상                            | 확인 사항                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| API 401 / redirect loop       | `:9000` 으로 접속했는지, Gateway·Keycloak 기동 여부                                                                         |
| 어드민 접근 시 홈으로 이동               | `lucas@lucas.com` 계정·`ADMIN` 역할                                                                                  |
| 403 Forbidden (POST/PUT 요청 시) | `XSRF-TOKEN` 쿠키·`X-XSRF-TOKEN` 헤더 전달 (`fetchWrapper`)                                                            |
| 이미지 업로드 실패                    | 백엔드에 주입된 Cloudflare R2 환경 변수가 올바른지, R2 버킷의 CORS 설정에 [http://localhost:9000이](http://localhost:9000이) 허용되어 있는지 여부 |


---

## 라이선스

개인 학습·포트폴리오 목적 프로젝트입니다.