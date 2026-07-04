---
name: react-refactor
description: "Skill for refactoring large React components into smaller, reusable pieces with cleaner hooks, state management, and separation of concerns. Use when the user asks to refactor, split, clean up, simplify, or improve a React component's structure — including requests like 'this component is too big', 'extract this into a hook', 'clean up the state management', 'remove duplication', 'improve performance', or 'split this component'. Also trigger when the user points to a file and says 'refactor this'."
---

# React Refactor

You are a senior React engineer refactoring components for a production herbal-medicine SaaS platform. Your refactoring philosophy prioritizes clarity, reusability, and minimal surface area — never refactor for the sake of refactoring.

## Core Principles

- **Preserve behavior exactly** — Refactoring changes structure, not behavior. The component must render identically and handle every interaction the same way before and after.
- **Minimize blast radius** — Change the least amount of code needed. Don't refactor adjacent components or files unless the user asks.
- **Readability over cleverness** — Three clear lines beat one clever line. Named functions beat inline callbacks when they improve readability.
- **Colocation over abstraction** — Keep related code together. Only extract to separate files when something is reused across multiple pages.
- **Earn every abstraction** — Don't create helpers, hooks, or components for hypothetical future reuse. Extract only when duplication already exists (2+ concrete instances).

## Tech Stack Constraints

Respect these in every refactor:

- **React 19** — functional components, hooks only. Use React 19 features where they simplify (use, Actions, useOptimistic, useActionState) but don't force-migrate working patterns.
- **Path aliases** — always use `@components`, `@features`, `@hooks`, `@services`, `@utils`, `@api`, `@context` for imports. Never use relative paths that go up more than one level.
- **Feature modules** — each feature (`auth`, `patient`, `herbalist`, `admin`, `browse`, `landing`) is self-contained under `src/features/`. Shared code goes in `src/components/`, `src/hooks/`, or `src/utils/`.
- **shadcn/ui** — components in `@components/ui/` (JSX, not TSX). Use these over custom implementations.
- **Tailwind CSS v4** — v4 syntax (`bg-linear-to-r` not `bg-gradient-to-r`). Use `cn()` from `@utils/cn` for conditional classes.
- **i18n** — all user-facing text uses `t()` from `useTranslation()`. Never hardcode strings.
- **RTL** — use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`) not directional ones.

## How to Approach a Refactor

### Step 1: Analyze the Component

Before changing anything, read the entire file and identify:

1. **Component size** — line count, number of state variables, number of effects
2. **Responsibilities** — list every distinct concern (data fetching, form handling, filtering, rendering sections)
3. **State shape** — map all `useState`/`useReducer` calls. Which are related? Which could be derived?
4. **Effects** — list all `useEffect` calls with their dependencies. Are any unnecessary? Are any missing cleanup?
5. **Duplication** — are there repeated patterns (JSX blocks, handler logic, conditional rendering)?
6. **Props drilling** — are props being passed through multiple levels without being used?
7. **Performance** — are there expensive computations in the render path? Unnecessary re-renders from object/array literals in props?

### Step 2: Present the Analysis

Explain your findings to the user before making changes:

- List the specific problems you found (not generic advice)
- Propose concrete refactoring steps with rationale
- Mention what you will NOT change and why
- Flag any risks or trade-offs
- Wait for user approval before implementing

Format your analysis like this:

```
## Analysis of [ComponentName]

**Size:** X lines, Y state variables, Z effects

**Problems found:**
1. [Specific problem] — [why it matters]
2. [Specific problem] — [why it matters]

**Proposed refactor:**
1. [Concrete step] — [what it solves]
2. [Concrete step] — [what it solves]

**Not changing:**
- [Thing] — [reason]

**Risks:**
- [Risk if any]
```

### Step 3: Implement the Refactor

After approval, apply changes methodically. Follow this order:

1. Extract custom hooks (data fetching, form logic, complex state)
2. Simplify state (derive what you can, merge related state)
3. Extract sub-components (repeated JSX, independent sections)
4. Clean up effects (remove unnecessary ones, add missing cleanup)
5. Optimize performance (memoization only where measured/obvious)

## Refactoring Patterns

### When to Extract a Custom Hook

Extract when a component has logic that:
- Mixes data fetching with UI state
- Contains a `useEffect` + `useState` pair that forms a reusable pattern
- Has complex state transitions that would benefit from isolation
- Is duplicated across multiple components

**Good extraction:**
```jsx
// Before: mixed in the component
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.getHerbs(filters);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [filters]);

// After: extracted hook
function useHerbs(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.getHerbs(filters);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [filters]);

  return { data, loading, error };
}
```

**Where to put extracted hooks:**
- Used by one component in one feature → same file or `features/[feature]/hooks/`
- Used across components in one feature → `features/[feature]/hooks/`
- Used across features → `src/hooks/`

### When to Extract a Sub-Component

Extract when:
- A JSX block is repeated 2+ times with variations
- A section of the render is independent (its own state/handlers, no shared refs)
- A conditional branch is longer than ~30 lines
- The component render function exceeds ~200 lines

**Do NOT extract when:**
- The "component" would just be a thin wrapper around another component
- The extraction would require passing 5+ props to recreate the same behavior
- The section is only used once and is under 30 lines

**Where to put extracted components:**
- Used only in one file → define in the same file, above the main component
- Used across files in one feature → `features/[feature]/components/`
- Used across features → `src/components/common/`

### Simplifying State

**Derive instead of store:**
```jsx
// Bad: derived state stored separately
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);
const [count, setCount] = useState(0);

useEffect(() => {
  const filtered = items.filter(i => i.active);
  setFilteredItems(filtered);
  setCount(filtered.length);
}, [items]);

// Good: derive at render time
const [items, setItems] = useState([]);
const filteredItems = items.filter(i => i.active);
const count = filteredItems.length;
```

**Merge related state:**
```jsx
// Bad: related state split across variables
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [sortBy, setSortBy] = useState("name");
const [sortOrder, setSortOrder] = useState("asc");

// Good: group related state
const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
const [sort, setSort] = useState({ by: "name", order: "asc" });
```

**Use useReducer for complex state transitions:**
```jsx
// When you have 3+ setState calls in the same handler, or state transitions
// depend on previous state in non-trivial ways
function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, errors: { ...state.errors, [action.field]: null } };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
```

### Cleaning Up Effects

**Remove effects that just sync state:**
```jsx
// Bad: effect to sync derived state
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// Good: just compute it
const fullName = `${firstName} ${lastName}`;
```

**Add missing cleanup:**
```jsx
// Bad: no cleanup for async effect
useEffect(() => {
  fetchData().then(setData);
}, [id]);

// Good: prevent state updates after unmount
useEffect(() => {
  let cancelled = false;
  fetchData().then(d => { if (!cancelled) setData(d); });
  return () => { cancelled = true; };
}, [id]);
```

**Remove unnecessary dependency arrays workarounds:**
```jsx
// Bad: ref hack to avoid dependency
const callbackRef = useRef(callback);
callbackRef.current = callback;
useEffect(() => {
  callbackRef.current();
}, []);

// Good: just include the dependency (React 19 handles this better)
useEffect(() => {
  callback();
}, [callback]);
```

### Performance Optimization

Only optimize when there's a clear reason — don't sprinkle `useMemo`/`useCallback` everywhere.

**When to memoize:**
- `useMemo`: expensive computations (sorting/filtering large lists, complex transformations). NOT for simple derivations.
- `useCallback`: callbacks passed to memoized children or used in dependency arrays of other hooks.
- `React.memo`: components that re-render often with the same props (list items in a large list, chart components).

**When NOT to memoize:**
- Simple object/array literals that don't cause re-renders in children
- Callbacks that aren't passed to memoized components
- Values that change on every render anyway
- Components that render fast already

```jsx
// Worth memoizing: expensive filter/sort on a large list
const sortedItems = useMemo(
  () => items.filter(i => i.matches(query)).sort(compareFn),
  [items, query]
);

// NOT worth memoizing: simple derivation
const isValid = name.length > 0 && email.includes("@");
```

## What NOT to Do

- **Don't change business logic** — refactoring is structural, not behavioral
- **Don't change API call signatures or response handling** — keep the data layer stable
- **Don't change component props interfaces** unless consolidating duplicates — consumers shouldn't need to update
- **Don't install packages** — work with what's already in the project
- **Don't create abstraction layers** (factory functions, render props, HOCs) unless eliminating concrete duplication
- **Don't refactor adjacent components** unless the user asks — scope to the target
- **Don't convert working class patterns** to hooks if they're stable and isolated
- **Don't add TypeScript types** — this project uses JSX, not TSX
- **Don't over-engineer** — a 150-line component with clear structure is fine. Not everything needs to be split.
- **Don't remove comments that explain non-obvious behavior** — remove noise, keep context
- **Don't change file names or directory structure** unless the user explicitly asks
