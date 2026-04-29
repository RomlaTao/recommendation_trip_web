# Frontend Context Notes

## Muc tieu

- Dung file nay lam nguon context chinh giua cac phien lam viec cua frontend.
- Moi phien bat dau va ket thuc deu cap nhat file nay de tranh mat context.

---

## Cach su dung theo phien

### 1) Truoc khi bat dau session

- Doc lai:
  - `ROADMAP.md`
  - phan `Current Session Snapshot` trong file nay
  - phan `Open Tasks (Next)`
- Chot scope session:
  - lam feature nao
  - API contract nao se dong vao
  - test muc tieu nao can dat

### 2) Trong khi implement

- Neu co thay doi quan trong ve:
  - API contracts FE
  - architecture boundary (`core`/`features`/`pages`)
  - state strategy (React Query vs Zustand)
    -> cap nhat ngay vao `Architecture Decisions`.

### 3) Ket thuc session

- Cap nhat day du 4 muc:
  - `Completed This Session`
  - `Open Tasks (Next)`
  - `Decisions / Risks Updated`
  - `Current Session Snapshot`

---

## Architecture Decisions

- Pattern: Lite Feature-Based (`core` / `features` / `pages`).
- `pages/` chi compose route-level UI, khong chua business logic.
- `features/*` gom API client, hooks, state, va feature-specific components.
- `core/components` la dumb UI (khong goi API, khong chua business state).
- Data-fetching chinh: TanStack Query.
- Local transient UX state (drag-drop draft): Zustand.

---

## API Contract Notes

> Cap nhat section nay khi backend doi payload/endpoint/guard behavior.

- Auth endpoints da doi chieu backend:
  - `POST /auth/login` -> response `{ userId, tokens }`
  - `POST /auth/refresh` -> response `{ tokens }`
  - `POST /auth/logout` -> response `null` (JWT required)
  - `GET /account/me` -> profile cua user dang dang nhap
- Trip endpoints (auth required):
  - `GET /trips`
  - `GET /trips/:tripId`
  - `GET /trips/public`
  - `GET /trips/public/:tripId`
  - `POST /trips`
  - `PATCH /trips/:tripId/visibility`
  - `DELETE /trips/:tripId`
  - `PATCH /trips/:tripId/restore`
  - nested day/item CRUD endpoints
- Public trip APIs hien tai van yeu cau user da dang nhap (JWT guard).

---

## Current Session Snapshot

- Date: 2026-04-28
- Session Goal: Hoan tat F5 Trip Builder foundation (Zustand draft + DnD + unsaved guard).
- Branch: `main`
- Scope: Add draft trip store, wire DnD builder board trong trip detail, va debounce sync day/item operations.
- Build/Test Status: `npm run lint` pass, `npm run build` pass.
- Notes: Trip detail da chuyen sang interactive builder; unsaved changes duoc guard khi leave page/reload.

---

## Completed This Session

- [x] Ra soat roadmap hien tai va doi chieu voi state code frontend.
- [x] Chot huong uu tien moi theo data dependency:
  - Auth gate hardening
  - Catalog/Place read foundation
  - Trip Management CRUD foundation
  - Trip Builder (DnD) sau cung
- [x] Dong bo lai `ROADMAP.md` theo phase/milestone moi.
- [x] Implement response interceptor cho `401 Unauthorized` trong `core/api/axios.ts`.
- [x] Them co che refresh token + retry request goc (single-flight).
- [x] Them fallback clear session + redirect `/login` khi refresh fail/khong co refresh token.
- [x] Tinh chinh refresh flow theo backend auth: validate refresh token truoc khi goi API, xu ly format loi NestJS (`message` string/array), va tranh gui bearer token cho request `/auth/refresh`.
- [x] Scaffold `features/catalog` voi `contracts.ts`, `client.ts`, `hooks.ts`, `components/place-card.tsx`, `components/place-list.tsx`.
- [x] Implement `pages/places/places-explore.tsx` voi loading/error/empty/success, search, category filter, pagination.
- [x] Add protected route `/places` va nav link trong app layout.
- [x] Scaffold `features/trip` voi `contracts.ts`, `client.ts`, `hooks.ts`, `components/trip-card.tsx`, `components/trip-list.tsx`, `components/trip-detail-board.tsx`, `components/create-trip-dialog.tsx`.
- [x] Replace placeholder pages `trips.tsx`, `trips-public.tsx`, `trip-detail.tsx` bang query-driven read flow.
- [x] Implement quick-create draft trip: dialog -> `POST /trips` -> invalidate query -> redirect detail.
- [x] Add `features/trip/store.ts` + `features/trip/mappers.ts` cho draft state va operation queue.
- [x] Add Trip Builder UI (`trip-builder-board`, `trip-day-column`, `trip-item-card`) voi native drag/drop day-item reorder.
- [x] Integrate unsaved-change guard (`useBlocker`, `useBeforeUnload`) + debounce persist operations trong `trip-detail.tsx`.
- [x] Extend trip write layer (`add/update day`, `add/update/remove/reschedule item`) trong `client.ts` va `hooks.ts`.

---

## Open Tasks (Next)

- [ ] Bat dau F6 hardening: query error states/skeletons va retry/backoff policy.
- [ ] Mo rong UX feedback cho builder sync failures (toast + retry control).
- [ ] Danh gia a11y cho drag/drop interactions (keyboard support) truoc E2E.

---

## Decisions / Risks Updated

### Decisions

- Profile endpoint cho auth bootstrap chot theo backend la `GET /account/me` (khong dung `/auth/profile`).
- Session strategy F1: luu `accessToken` + `refreshToken` trong localStorage va bootstrap lai luc app mount.
- Route `/trips*` bat buoc qua `AuthGuard`, route `/login` de public.
- Delivery strategy moi: di theo Data Flow Driven thay vi nhay som vao Trip Builder.
- Trip Builder duoc day sau Catalog + Trip Management de tranh thieu nguon du lieu dau vao.
- Auth gate strategy F2: response `401` se refresh token 1 lan (single-flight), retry request goc, va fallback redirect `/login` neu refresh fail.
- Catalog phase F3 su dung category filter dynamic tu backend endpoint `/places/categories` thay vi hardcode.
- Trip phase F4 uu tien read + quick-create, chua mo mutation edit day/item de danh cho F5.
- Trip phase F5 dung operation queue trong Zustand va debounce flush de giam spam mutation khi DnD lien tuc.

### Risks

- LocalStorage token strategy can review lai neu doi sang HttpOnly cookie trong tuong lai.
- Chua co event-level session sync voi auth store khi redirect login; hien tai uu tien luong HTTP safety tai interceptor.
- Neu place contracts backend thay doi (filter/category/pagination), se anh huong truc tiep den timeline vao Trip Builder.
- Chua implement nearby/detail place view; hien tai chi cover list explore use case de phuc vu dau vao cho Trip.
- Trip list endpoints hien tra mang khong co `total`, nen pagination F4 dang theo heuristic (next khi item count == pageSize).
- DnD hien tai uu tien native pointer interactions; keyboard-accessible drag/drop can bo sung o F6 (a11y hardening).

---

## Hand-off Checklist

Truoc khi ket thuc phien, dam bao:

- [x] `Current Session Snapshot` da du thong tin
- [x] `Completed This Session` da cap nhat
- [x] `Open Tasks (Next)` da duoc sap lai uu tien
- [x] `Decisions / Risks Updated` da phan anh thay doi moi
