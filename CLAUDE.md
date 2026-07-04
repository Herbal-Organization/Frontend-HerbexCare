# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Preview production build:** `npm run preview`

No test framework is configured.

## Architecture

This is a React 19 SPA built with Vite, Tailwind CSS v4, and react-router-dom v7. It's a herbal medicine platform with three user roles, each with its own feature module and dashboard.

### Path Aliases

Configured in `vite.config.js` and `jsconfig.json`. Use these for all imports:
`@components`, `@features`, `@hooks`, `@services`, `@utils`, `@api`, `@context`, `@config`, `@assets`, `@i18n`, `@` (src root).

### Feature Modules (`src/features/`)

Each feature is a self-contained module with `pages/`, `components/`, `hooks/`, and `services/` subdirectories:

- **auth** — Login, registration, email confirmation, password reset. Google OAuth via `@react-oauth/google`. JWT tokens stored in localStorage, auto-refreshed via axios interceptor.
- **patient** — Patient dashboard with nested routes, cart (herbs/recipes/AI recipes), orders, medical history, AI consultations.
- **herbalist** — Herbalist dashboard: manage herbs, recipes, AI recipes, diseases, sub-orders, inventory.
- **admin** — SuperAdmin dashboard: user management, system oversight.
- **browse** — Public browsing pages for herbs, recipes, herbalists (used within patient routes).
- **landing** — Landing page, 404 page.

### Routing & Auth

`App.jsx` defines all routes. Role-based access is enforced by `ProtectedRoute` component which checks JWT expiry and role from the token. Three role values: `"Patient"`, `"Herbalist"`, `"SuperAdmin"`. Dashboard routes use wildcard (`/*`) and define nested routes internally.

### API Layer (`src/api/`)

- `config.js` — API base URL (Azure-hosted .NET backend).
- `httpClient.js` — Axios instance with Bearer token injection, auto-refresh on 401, and `Accept-Language` header from i18n. All API modules import this client.
- Individual API modules (`herbs.js`, `recipes.js`, `orders.js`, etc.) export functions that call specific endpoints.

### Shared Components (`src/components/`)

- `ui/` — shadcn/ui components (configured via `components.json`, JSX not TSX, CSS variables enabled).
- `common/` — Reusable business components (Pagination, StatusBadge, OrderCard, DiseaseForm, etc.).
- `layouts/` — `DashboardLayout` and `DashboardSidebar` shared across all three role dashboards.
- `features/` — Cross-feature shared components.

### State & Context (`src/context/`)

- `CartContext` — Patient shopping cart, persisted to localStorage. Holds herbs, recipes, and AI recipes.
- `ThemeContext` — Dark/light mode toggle.
- `LandingThemeContext` — Separate theme context for the landing page.

### i18n

English and Arabic (`src/i18n/locales/`). RTL support toggles automatically with language. Use `useTranslation()` hook and `t()` function. Language stored in localStorage.

### Forms & Validation

`react-hook-form` with `zod` for schema validation.

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin. Dark mode supported via ThemeContext classes. `cn()` utility from `@utils/cn` (clsx + tailwind-merge) for conditional class merging.
