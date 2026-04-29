# Frontend Roadmap

## Recommendation Trip Web

> Muc tieu: xay dung frontend theo kien truc **Lite Feature-Based Architecture** dong bo voi backend hien tai.
> Pattern: `core` + `features` + `pages`, uu tien toc do giao hang va de maintain.

---

## 0) Kien truc tong the

```text
src/
├── app/                      # bootstrap providers/router/global guards
├── core/                     # dung chung toan app
│   ├── api/                  # axios client, interceptors, auth header
│   ├── components/           # dumb ui components (shadcn wrapped)
│   ├── utils/                # formatters, validators, helpers
│   └── constants/            # app constants, query keys goc
├── features/                 # domain features (trip, auth, ...)
│   ├── auth/
│   │   ├── client.ts
│   │   ├── hooks.ts
│   │   ├── store.ts
│   │   ├── contracts.ts
│   │   └── components/
│   └── trip/
│       ├── client.ts
│       ├── hooks.ts
│       ├── store.ts          # optional cho drag-drop draft state
│       ├── contracts.ts
│       └── components/
└── pages/                    # route composition only (khong business logic)
    ├── login.tsx
    └── trips/
        ├── index.tsx
        ├── public.tsx
        └── [tripId].tsx
```

---

## 1) Nguyen tac bat buoc

1. **Page la le tan**  
   `pages/` chi compose UI, khong goi API truc tiep.

2. **Feature dong goi nghiep vu**  
   Moi domain (`trip`, `auth`) tu quan ly API hooks, contracts, UI.

3. **Dumb vs Smart components**
   - `core/components`: khong biet API/user/session.
   - `features/*/components`: duoc phep goi hooks/store.

4. **Read model contract-first**  
   FE map theo response DTO backend (`TripResponseDto`) qua `contracts.ts`.

5. **Khong dung synchronize tu FE mindset**  
   Moi thay doi API contract phai cap nhat typed contracts + query hooks.

---

## 2) Cong nghe va setup

- Bundler: **Vite + React + TypeScript**
- Data fetching/cache: **TanStack Query**
- Local transient state: **Zustand**
- UI kit: **shadcn/ui**
- Form + validation: **React Hook Form + Zod**
- Routing: **React Router** (hoac Next App Router neu doi stack)

---

## 3) Mapping voi backend trip hien tai

### Auth-required endpoints da co

- `POST /trips`
- `GET /trips`
- `GET /trips/:tripId`
- `GET /trips/public`
- `GET /trips/public/:tripId`
- `PATCH /trips/:tripId/visibility`
- `DELETE /trips/:tripId`
- `PATCH /trips/:tripId/restore`
- Nested day/item CRUD:
  - `POST /trips/:tripId/days`
  - `PATCH /trips/:tripId/days/:dayId`
  - `DELETE /trips/:tripId/days/:dayId`
  - `POST /trips/:tripId/days/:dayId/items`
  - `PATCH /trips/:tripId/days/:dayId/items/:itemId`
  - `PATCH /trips/:tripId/days/:dayId/items/:itemId/time`
  - `DELETE /trips/:tripId/days/:dayId/items/:itemId`

### FE contracts can co trong `features/trip/contracts.ts`

- `TripResponse`
- `TripDayResponse`
- `TripItemResponse`
- `CreateTripPayload`
- `UpdateTripVisibilityPayload`
- `Add/Update day payload`
- `Add/Update/Reschedule item payload`

---

## 4) Delivery phases (Data Flow Driven)

## Phase F0 - Bootstrap

- [x] Init project Vite + TS
- [x] Setup eslint/prettier/path alias (`@/`)
- [x] Setup `app/providers` (QueryClientProvider, Router)
- [x] Setup `core/api/axios.ts` + auth interceptor
- [x] Add base layout + error boundary + loading shell

## Phase F1 - Auth foundation

- [x] `features/auth/client.ts` (login/refresh/logout/profile)
- [x] `features/auth/hooks.ts`
- [x] `features/auth/store.ts` cho session token state
- [x] `AuthGuard` + route protection
- [x] Login page + basic session bootstrap

## Phase F2 - Auth gate hardening

- [x] Hoan thien response interceptor cho `401 Unauthorized` trong `core/api/axios.ts`
- [x] Chot chinh sach:
  - [x] refresh token + retry request goc (uu tien)
  - [x] fallback clear session + redirect `/login` khi refresh fail
- [x] Dam bao route protected su dung guard nhat quan (`AuthGuard`/`ProtectedRoute`)
- [x] Dong bo docs ve auth gate readiness truoc khi mo rong module tiep theo

## Phase F3 - Catalog / Place read foundation

- [x] Scaffold `features/catalog`:
  - [x] `client.ts`
  - [x] `hooks.ts`
  - [x] `contracts.ts`
  - [x] `components/PlaceCard.tsx`
- [x] Trang Explore/Places:
  - [x] Search input
  - [x] Category filter (load dynamic tu `/places/categories`)
  - [x] Grid PlaceCard + pagination
- [x] React Query data flow cho places list (`DB -> NestJS -> Query -> UI`)
- [x] Loading/error/empty/success states cho places page

## Phase F4 - Trip Management (CRUD foundation)

- [x] `features/trip/client.ts`: list mine, detail mine, list public, detail public
- [x] `features/trip/hooks.ts`: query keys + hooks
- [x] Pages:
  - [x] `pages/trips/index.tsx` (my trips)
  - [x] `pages/trips/public.tsx` (public trips)
  - [x] `pages/trips/[tripId].tsx` (trip detail)
- [x] Components:
  - [x] `TripCard`
  - [x] `TripList`
  - [x] `TripDetailBoard` (read-only before write flows)
- [x] Them quick-create flow (modal/dialog): destination + so ngay -> `POST /trips`
- [x] Khoi tao trip DRAFT va dieu huong vao trang detail sau khi tao

## Phase F5 - Trip Builder (Draft planning UX)

- [x] Add `features/trip/store.ts` cho drag-drop transient draft
- [x] Integrate DnD board (day/item reorder)
- [x] Unsaved change guard
- [x] Convert draft state -> final sync operations cho day/item mutation flow

## Phase F6 - Hardening

- [ ] Query error states/chunked skeletons
- [ ] Retry/backoff policy per endpoint group
- [ ] Accessibility pass (keyboard/aria for board)
- [ ] Performance pass (memoization, virtualization neu can)
- [ ] E2E test critical flows (login -> create -> edit -> public view)

---

## 5) Quy uoc code-level

- `client.ts`: chi chua HTTP calls, khong React hooks.
- `hooks.ts`: chua `useQuery/useMutation`, tuong tac QueryClient.
- `store.ts`: chi dung cho local UX state (khong thay React Query cache).
- Moi mutation thanh cong phai invalidates dung query keys lien quan.
- Route public trip van yeu cau logged-in session (theo backend guard hien tai).

---

## 6) Milestones de ban giao

### M1 - Auth gate on dinh + Catalog san sang

- Login ok
- Auth guard + 401 strategy ok
- Places explore/filter/list ok

### M2 - Co the quan ly trip co ban

- My trip list/detail ok
- Public trip list/detail ok
- Create trip DRAFT tu dialog ok

### M3 - Co the chinh sua trip day-item va keo tha

- Drag-drop draft board
- Unsaved guard
- Add/update/remove/reschedule item ok
- Delete/restore + visibility toggle ok

### M4 - Stable production UX

- Stable loading/error UX
- Retry/backoff policy
- A11y/performance/E2E critical flows

---

## 7) Risks va canh bao

- Backend dang tiep tuc mo rong trip lifecycle (`confirm/cancel/start/complete`), FE contracts can version-aware.
- Neu API payload doi ten field, bat buoc cap nhat `contracts.ts` truoc khi sua components.
- Public endpoints hien yeu cau auth; neu sau nay mo anonymous, can tach route guard strategy.
- Module Trip Builder phu thuoc chat vao nguon place data; neu place API/chuan filter doi can cap nhat lai UX keo tha.

---

## 8) Backlog tiep theo (sau roadmap nay)

- Add timeline/day calendar view
- Add place-preview composition voi place catalog
- Add activity log cho trip edits
- Add offline draft backup (localStorage)
