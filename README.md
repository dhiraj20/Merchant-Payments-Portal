# Merchant Payments Portal

> Senior Frontend Take-Home Assignment — Angular 22 · Angular Material · Signals · RxJS · Reactive Forms · Vitest

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Angular 22 (standalone components, `@if`/`@for`) |
| UI Library | Angular Material 22 (M3 theme) |
| State | Signals + `computed()` + RxJS |
| Forms | Reactive Forms + custom validators |
| Routing | Angular Router (lazy-loaded features) |
| Auth | HTTP Interceptor with automatic 401 → token refresh |
| Testing | Vitest + Angular TestBed |
| Mock API | json-server (custom Express middleware) |

---

## Quick Start

### Prerequisites
- Node.js ≥ 22.22.3
- npm ≥ 10.9

### Install dependencies
```bash
npm install
```

### Run (app + mock API together)
```bash
npm run start:all
```

This starts:
- **Angular dev server** at `http://localhost:4200`
- **Mock API** at `http://localhost:3000`

### Run separately
```bash
# Terminal 1 — Mock API
npm run mock

# Terminal 2 — Angular dev server
npm start
```

---

## Demo Credentials

| Email | Password | Role |
|---|---|---|
| `sales@test.com` | `pass` | SALES |
| `reviewer@test.com` | `pass` | REVIEWER |
| `admin@test.com` | `pass` | ADMIN |

---

## User Roles & Permissions

| Feature | SALES | REVIEWER | ADMIN |
|---|---|---|---|
| View dashboard | ✓ | ✓ | ✓ |
| Create / edit application | ✓ | — | — |
| View application detail | ✓ (own) | ✓ | ✓ |
| Approve / Reject application | — | ✓ | ✓ |
| Reveal sensitive fields (SSN, Tax ID, Bank Acct) | — | ✓ | ✓ |
| Assign reviewers | — | — | ✓ |
| Admin panel | — | — | ✓ |

---

## Running Tests

```bash
# Run all unit tests
npm test

# Run with coverage report
npm run test:coverage
```

Test coverage targets: 70% lines minimum.

### Test files
- `auth.service.spec.ts` — Auth signals, login, logout, hasRole
- `token-refresh.interceptor.spec.ts` — Bearer token attachment, 401 refresh, logout on failure
- `custom-validators.spec.ts` — SSN, age, routing number, EIN, URL, cross-field validators
- `sensitive-field.component.spec.ts` — Mask/reveal by role
- `permission.directive.spec.ts` — Role-based DOM rendering
- `dashboard.component.spec.ts` — Loading, error/retry, pagination, role-aware columns

---

## Project Structure

```
src/app/
├── core/
│   ├── auth/
│   │   ├── auth.service.ts           ← Signals: currentUser, role, isLoggedIn
│   │   ├── auth.guard.ts             ← Role-aware CanActivateFn
│   │   └── token-refresh.interceptor.ts  ← Bearer attach + queued 401 retry
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── merchant.model.ts
│   │   └── review.model.ts
│   └── services/
│       ├── merchant.service.ts       ← Server-side paginated API calls
│       └── draft.service.ts          ← localStorage + API draft sync
├── features/
│   ├── auth/login.component.ts
│   ├── dashboard/                    ← MatTable + pagination + filters
│   ├── merchant-form/                ← 4-step MatStepper wizard + auto-save
│   │   └── steps/
│   │       ├── step-business-info/
│   │       ├── step-owner-info/
│   │       ├── step-financial/
│   │       └── step-review-submit/
│   ├── application-detail/           ← Detail + reviewer panel
│   └── admin/                        ← Reviewer assignment (ADMIN only)
└── shared/
    ├── components/
    │   ├── sensitive-field/          ← Mask/reveal with role-based CSP
    │   ├── status-badge/
    │   └── confirm-dialog/
    ├── directives/
    │   └── permission.directive.ts   ← *hasRole="['ADMIN']"
    └── validators/
        └── custom-validators.ts      ← SSN, age, routing #, EIN, URL
```

---

## Key Architecture Decisions

### Auth & Role Signals
```ts
currentUser = signal<User | null>(null);
role = computed(() => this.currentUser()?.role ?? null);
isLoggedIn = computed(() => !!this.currentUser());
```

### Token Refresh Interceptor
Concurrent 401 responses are queued. Only **one** refresh call is made via `BehaviorSubject`. All queued requests are replayed with the new token. On refresh failure, the user is logged out.

### Auto-Save Draft
```ts
form.valueChanges.pipe(
  debounceTime(1500),
  distinctUntilChanged(...),
  filter(() => form.dirty),
  switchMap(value => draftService.syncDraftToServer(draftId, value))
)
```
localStorage is written immediately (500ms debounce); server sync is debounced at 1500ms.

### Sensitive Field Masking + CSP
- `SensitiveFieldComponent` masks by default; role-gated reveal button
- Roles allowed to reveal: REVIEWER, ADMIN
- CSP header configured in `index.html` with `default-src 'self'`

### Permission Directive
```html
<div *hasRole="['ADMIN', 'REVIEWER']">Reviewer-only content</div>
```

---

## Content Security Policy

Configured in `src/index.html`:
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' http://localhost:3000;
```

This prevents XSS by blocking inline scripts and restricting resource origins.

---

## AI Assistance Disclosure

This project was developed with Claude Code (Anthropic) as a coding assistant. Claude was used to:
- Generate boilerplate component scaffolding
- Suggest RxJS operator chains for auto-save and 401 retry logic
- Write initial unit test cases

All generated code was reviewed, understood, and verified by the candidate. The candidate can explain every architectural decision, pattern, and line of code during the review interview.

---

## Build for Production

```bash
ng build --configuration=production
```

Output in `dist/merchant-portal/`.
