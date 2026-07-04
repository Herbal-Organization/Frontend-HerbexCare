---
name: api-integrator
description: "Skill for integrating REST APIs into this React frontend from Swagger/OpenAPI docs. Use when the user wants to wire up a backend endpoint, add an API service function, build a data-fetching hook, connect a page/component to the backend, analyze API/Swagger documentation, map endpoints to UI features, or discover missing UI features the API already supports. Trigger on requests like 'integrate this endpoint', 'add an API call for X', 'create a service for Y', 'hook this up to the backend', 'what can we build with this API', or when the user pastes a Swagger/OpenAPI spec."
---

# API Swagger Link

https://herbal-api-v1-geg9dub2brgee4ag.austriaeast-01.azurewebsites.net/swagger/index.html

# API Integrator

You are a senior React engineer integrating a REST API (Azure-hosted .NET backend) into a production herbal-medicine SaaS platform. You turn API documentation into clean service functions, data-fetching hooks, and wired-up UI — always matching the existing architecture, never inventing new patterns.

## Core Principles

- **Match existing code, don't reinvent.** Read a neighboring file in the same directory before writing a new one. Copy its structure, naming, error handling, and comment style.
- **One responsibility per layer.** Raw HTTP lives in `src/api/`. Data-fetching + state lives in hooks. UI lives in components. Never call `httpClient` directly from a component.
- **Earn every abstraction.** Only create a hook or helper when a page actually needs it. Don't scaffold speculative endpoints "for later."
- **Surface the truth.** If the Swagger spec and the existing code disagree, or an endpoint's shape is ambiguous, say so instead of guessing.

## Tech Stack Constraints

- **Path aliases** — always import via `@api`, `@features`, `@components`, `@hooks`, `@utils`, `@context`. API modules internally use the relative `"./httpClient"`.
- **HTTP client** — every service function imports the shared `httpClient` from `@api/httpClient` (`import httpClient from "./httpClient"` inside `src/api/`). It already injects the Bearer token, auto-refreshes on 401, and sets `Accept-Language` from i18n. Never create a new axios instance and never manually attach auth headers.
- **i18n** — all user-facing text (including error messages shown in UI) uses `t()` from `useTranslation()`. Never hardcode strings in components.
- **RTL** — logical Tailwind properties (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`).
- **React 19** — functional components and hooks only.

## Workflow

### 1. Analyze the API documentation

When given a Swagger/OpenAPI spec (URL, JSON, or pasted text):

- Group endpoints by resource (Herbs, Recipes, Orders, …) — one resource maps to one file in `src/api/`.
- For each endpoint capture: method, path, path/query params, request body shape, response shape, auth requirement.
- Note the pagination convention (`PageNumber`, `PageSize`, `SearchValue`, `SortColumn`, `SortDirection` — PascalCase query params, see `src/api/herbs.js`).
- Flag `multipart/form-data` endpoints (anything uploading images/files) — these need a `FormData` builder, not JSON.

### 2. Map endpoints to frontend features

Before writing code, produce a short mapping table so the user can confirm scope:

| Endpoint | Existing consumer? | Proposed service fn | Proposed hook | UI target |
| -------- | ------------------ | ------------------- | ------------- | --------- |

- Check whether a service function already exists (`grep` the endpoint path across `src/api/`) before adding one — this codebase has near-duplicate resources (`inventoryAIRecipes` vs `inventoryAiChatRecipes`, etc.).
- Identify which role/feature module owns the UI (`auth`, `patient`, `herbalist`, `admin`, `browse`, `landing`).

### 3. Suggest missing UI features

After mapping, call out API capabilities that have no UI yet — e.g. an endpoint supports sorting/filtering the UI doesn't expose, a delete/approve endpoint with no button, a status the UI never renders. Present these as a short prioritized list and let the user pick; don't build them unprompted.

### 4. Write service functions (`src/api/<resource>.js`)

Follow the pattern in `src/api/herbs.js` exactly:

```js
import httpClient from "./httpClient";

export const getAllRecipes = async (
  pageNumber = 1,
  pageSize = 10,
  searchValue = "",
  sortColumn = "",
  sortDirection = "",
) => {
  const { data } = await httpClient.get("/api/Recipes/all", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchValue: searchValue,
      SortColumn: sortColumn,
      SortDirection: sortDirection,
    },
  });
  return data;
};

export const getRecipeById = async (recipeId) => {
  const { data } = await httpClient.get(`/api/Recipes/${recipeId}/get-id`);
  return data;
};
```

Rules:

- Named exports, `async` arrow functions, one per endpoint.
- Destructure and return `data` — never return the raw axios response.
- **Do not** wrap calls in try/catch here. Let errors propagate so the hook/UI layer can handle them. (The response interceptor already logs them.)
- For file uploads, add a `buildXFormData(payload)` helper and pass `headers: { "Content-Type": "multipart/form-data" }` (see `createHerb`).
- Keep the brief explanatory comments this codebase uses for non-obvious params.

### 5. Suggest / write React hooks

For anything a component consumes, provide a hook that owns loading and error state. Follow `src/features/browse/hooks/useRecipeDetails.js`:

```js
import { useCallback, useEffect, useState } from "react";
import { getAllRecipes } from "@api/recipes";

function useRecipes(params) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getAllRecipes(...params);
      setData(response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to load recipes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, reload: load };
}

export default useRecipes;
```

Rules:

- State trio: data, `isLoading` (default `true` for fetch-on-mount), `error` (default `""`).
- Wrap the loader in `useCallback`, trigger from `useEffect`, expose a `reload`.
- Place read hooks in the owning feature's `hooks/` dir. For mutations (create/update/delete), expose an async action that returns/throws so the caller can handle success (toast, navigate, reload).

### 6. Authentication, errors, loading

- **Auth** is automatic via `httpClient`. If an endpoint is public (login, register, forgot/reset password, refresh, logout) it's already in `AUTH_EXCLUDED_PATHS` — confirm new public endpoints are handled there if 401-refresh must be skipped.
- **Errors** — extract the message in the hook with the standard chain: `err.response?.data?.message || err.response?.data?.title || "<fallback>"`. In components, feed the fallback through `t()`.
- **Loading** — components branch on `isLoading` / `error` / empty-data states. Never leave a fetch without a visible loading and error path.

## Checklist before finishing

- [ ] Read a sibling file and matched its style.
- [ ] Service function returns `data`, no manual auth headers, no swallowed errors.
- [ ] Hook owns loading + error and exposes `reload`.
- [ ] No `httpClient` calls inside components.
- [ ] Path aliases used; user-facing strings go through `t()`.
- [ ] Reported any endpoints that duplicate existing ones or that enable missing UI features.
