# AGENTS.md

Quick context for this React 19 SPA so future sessions avoid guessing wrong.

## Stack

- Vite 7 + SWC (not Babel)
- Tailwind CSS v4 (plugin via @tailwindcss/vite; no `tailwind.config.js`)
- react-router-dom v7 (SPA routing, no `BrowserRouter`)
- Forms: `react-hook-form` + `zod`
- HTTP: Axios with custom `httpClient` (`src/api/httpClient.js`), JWT auto-refresh on 401
- i18n: react-i18next, lazy-loaded Arabic (`ar`), RTL auto-toggled on `<html dir>`
- Auth: JWT in localStorage, Google OAuth via `@react-oauth/google`

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # ESLint (eslint.config.js, flat config, ignores `dist`)
```

No test framework is configured.

## Path Aliases

Use these in all source files (configure in `vite.config.js` and `jsconfig.json`):

- `@` → `src`
- `@components`, `@features`, `@hooks`, `@services`, `@utils`, `@api`, `@context`, `@config`, `@types`, `@assets`, `@i18n`

## Routing & Auth

- `App.jsx` defines all routes; dashboards use wildcard (`/*`) and handle nested routes internally.
- Role-based access via `ProtectedRoute` (`src/features/auth/components/ProtectedRoute.jsx`).
- Allowed roles: `"Patient"`, `"Herbalist"`, `"SuperAdmin"`.
- If editing a route, also protect it with the correct role(s) via `<Route element={<ProtectedRoute allowedRoles={[...]} />}>`.

## API Layer

- `src/api/config.js` — base URL for the Azure-hosted .NET backend.
- `src/api/httpClient.js` — Axios instance:
  - Injects `Authorization: Bearer <accessToken>` from `localStorage`
  - Adds `Accept-Language` header from `localStorage` (`i18nextLng`)
  - Auto-refreshes on 401 using `/api/Accounts/refresh`
  - Skips auth for `AUTH_EXCLUDED_PATHS` (login, register, forgot/reset password, refresh, logout, google-login)
- All API modules import `httpClient` from `@api/httpClient`.

## State & Context

- `CartContext` (`src/context/CartContext.jsx`) — patient shopping cart persisted to `localStorage` under `herbal_patient_cart`. Holds `herbs`, `recipes`, and `aiRecipes`.
- `ThemeContext` (`src/context/ThemeContext.jsx`) — dark/light; key `herbal_theme` in `localStorage`.
- `LandingThemeContext` — separate theme context for the landing page only.

## i18n & RTL

- Default locale is English (`en.json` eagerly loaded); Arabic (`ar.json`) lazy-loaded on first switch.
- `localStorage` key for language: `language`.
- On language change, `document.documentElement.dir` is set to `rtl` or `ltr`.
- Always use `useTranslation` and `t()` for UI strings.

## Feature Modules (`src/features/`)

Each feature is self-contained with `pages/`, `components/`, `hooks/`, and `services/`:

- **auth** — Login, register, email confirmation, forgot/reset password. `authSession.js` manages token storage and refresh.
- **patient** — Dashboard (nested routes), cart, orders, medical history, AI chat consultations.
- **herbalist** — Dashboard: manage herbs, recipes, AI recipes, diseases, sub-orders, inventory, financials.
- **admin** — SuperAdmin dashboard: user management.
- **browse** — Public browsing: herbs, recipes, herbalists (used within patient routes).
- **landing** — Landing page, 404 page.

## Styling / UI

- Tailwind v4 CSS-first approach; classes in `src/index.css`.
- shadcn/ui components in `src/components/ui/` (JSX, not TSX; CSS variables enabled, baseColor `neutral`).
- `cn()` utility at `src/utils/cn.js` (clsx + tailwind-merge).
- Dark mode supported via `ThemeContext` classes (`dark:` modifiers).
- Import shadcn components from `@/components/ui`, not from external packages (unless new).

## Common Gotchas

- Do not guess Tailwind v3 config; there is none. Tailwind v4 `@import "tailwindcss"` is already wired in `src/index.css`.
- Do not create a `tailwind.config.js`; this project uses the v4 CSS-based config.
- Components imported from `@components/ui/` may not exist yet; `components.json` points aliases there.
- When linking a new page to routing, match the lazy-import + `Suspense` pattern already used in `App.jsx`.
- `ProtectedRoute` returns `<Outlet />` when authenticated and role matches; wrap its parent routes inside a `<Route element={<ProtectedRoute .../>}>` block, not as a component inside a route element.
- When adding a new API module:
  - Create it at `src/api/<feature>.js`.
  - Import `httpClient` from `@api/httpClient`.
  - Export functions that hit specific backend endpoints.
