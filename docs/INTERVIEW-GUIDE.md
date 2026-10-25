# Talking about DevJobs

A guide for presenting this project to interviewers and clients: what to say, what to show, and the reasoning behind each decision so you can answer follow-up questions with confidence.

---

## The 30-second pitch

> “DevJobs is a job board for tech roles that runs with **no servers**. A data pipeline pulls about 4,000 listings from a public API at build time, throws away the ~80% that aren't real tech jobs, extracts skills and salaries, and Next.js pre-renders every job and company page as static HTML. Search, accounts and a Kanban application tracker all run in the browser. It's hosted free on GitHub Pages and a GitHub Actions workflow refreshes the data every six hours — after lint, type checks, 128 unit tests and an end-to-end suite with accessibility audits pass.”

## The 2-minute demo script

1. **Landing page** — “Everything here — the stats, roles, trending skills, top companies — was computed at build time. View source: it's all in the HTML.” Toggle the theme: “Light, dark and system, with no flash on reload.”
2. **Search** — type `react`, open *Work mode* → tick *Remote*. “Results and every facet count update instantly; the counts are *disjunctive*, so each one tells you what you'd get by adding that option.” Point at the URL: “The whole search is in the URL — copy it, share it, hit Back.”
3. Click a few results — “Split view like LinkedIn: the preview loads a small per-job JSON file.”
4. Press **⌘K**, type `platform` — “Command palette over the same search engine.”
5. **Sign in → Try the demo account.** “The demo is seeded from the *live* catalog using my own recommendation logic, so the dashboard is realistic.” Show match scores and saved searches with “new since you last looked”.
6. **Tracker** — drag a card to *Interviewing*, then use the `…` menu: “Drag and drop isn't accessible on its own, so every card has a keyboard/touch menu that does the same thing.” Open a card, type a note, close it, reopen: autosaved.
7. **How it's built** page — architecture diagram and the real pipeline numbers for this build.

## Before → after

| | Original version | This version |
|---|---|---|
| Hosting | Next.js server features (API routes, SQLite, middleware) — which **can't run on GitHub Pages**; the live URL was only showing the README | Static export that actually runs on GitHub Pages |
| Data | First page of the API, fetched per request | Pipeline: ~4,200 rows → classified, cleaned, deduped → ~800 published |
| Search | Filter the 20 loaded jobs by title | Full-text + 6 facets + sort + pagination over the whole catalog, URL-driven |
| Accounts | One-click fake cookie | Sign up/in with validation, hashed passwords, profile, onboarding, demo account |
| Saved jobs | A list | Kanban tracker with stages, notes, timeline, undo, list view |
| UI | One dark theme | Design system with light/dark/system themes, responsive, accessible |
| Quality | No tests | 128 unit tests, 41 e2e tests incl. axe audits, CI gates every deploy |

---

## Deep dives (likely questions)

### “Why static? Why not just deploy the server version to Vercel?”

- The goal was GitHub Pages: free, nothing to maintain, nothing to go down. Pages only serves files, so the architecture had to move all *computation* to build time and all *interaction* to the browser.
- Listings change on the scale of hours, not seconds, so a scheduled rebuild every 6 hours is fresh enough. That's essentially ISR done by CI.
- Trade-offs I accepted: per-user data can't live on a server (so accounts are demo-only); search covers the snapshot, not the whole upstream API; the build does real work (~950 pages in about 10 seconds).
- What would change on a server platform: auth and the tracker would move behind the existing service functions (see below); search could move server-side once the catalog outgrew the browser.

### “Walk me through the data pipeline.”

`scripts/build-catalog.ts` is a small ETL job:

- **Extract** — a fixed request plan (category slices, a few cities, intern/entry levels, and page 0 for each of ~290 tech companies in the directory). Concurrency of 4, exponential-backoff retries, and it refuses to publish if more than 20% of requests fail. About 400 requests per run, inside the 500/hour anonymous rate limit.
- **Transform** — pure functions in `src/lib/catalog/`, all unit-tested:
  - *Role classifier*: ordered regex rules on the title, specific before generic (“Full Stack” beats “Software Engineer”). Guards: go-to-market titles (“Account Manager – Cybersecurity”) and hardware disciplines (“RF Front-End Module Design Engineer”) are rejected; ambiguous titles (“Research Scientist”, “Test Engineer”, “Product Manager”) need *evidence* — enough hard tech skills in the description.
  - *Stack refinement*: a generic “Software Engineer” whose description is clearly React-heavy becomes Frontend; React + Postgres becomes Full-stack.
  - *Skill extraction*: ~90 skills with careful patterns — “Go”, “Rust”, “Swift”, “React”, “Spring” are also English words, so they're case-sensitive or need context; EEO boilerplate like “accessibility accommodations” is ignored.
  - *Salary extraction*: regex for ranges (`$120,000 – $150,000`, `$95k to $130k`, hourly), then sanity checks (plausible bounds, max ≤ 4× min), skipping junk matches.
  - Dedupe re-posts, drop listings older than a year, cap any employer at 20.
- **Load** — `.data/catalog.json` (build-time only, includes sanitized descriptions), `public/data/jobs.json` (the ~125 KB gzipped search index) and one JSON file per job for the preview pane.
- **Resilience** — raw responses are cached; if a refresh fails, it falls back to the last good snapshot instead of failing the deploy.

*Why rules, not ML?* It's explainable, testable, deterministic and needs no training data. The tests document the edge cases. With labelled data, a small classifier could replace `classifyRole` without touching anything else.

### “How does search work without a search server?”

`src/lib/search/engine.ts`, about 200 lines:

- Each job becomes a document of tokenized fields with weights (title 6, skills/company 4, role 2.5, location 2, excerpt 0.5). Every query term must match some field (AND); prefix matching gives type-ahead; an exact token beats a prefix. A few aliases (`js`, `k8s`, `golang`).
- Facets: OR within a facet, AND across facets. Counts are **disjunctive**: each facet is counted with every *other* filter applied, so “Remote · 210” means “you'd get 210 if you add Remote”. That's how Algolia and LinkedIn behave.
- Complexity is a linear scan — about 800 docs × a few fields, well under a millisecond. Past ~50k docs I'd build an inverted index, move it into a Web Worker, or use Meilisearch/Typesense/Algolia.
- Docs are built once per index and cached in a `WeakMap`.

### “Why put state in the URL? How do you avoid router overhead?”

- Shareable, bookmarkable, Back/Forward work, refresh-safe — URL state is the source of truth. `src/lib/search/params.ts` is the only code that reads or writes it, and it produces **canonical** URLs (sorted lists, defaults omitted).
- Writes use `window.history.pushState/replaceState`, which Next.js syncs with `useSearchParams` — no router navigation or fetch per keystroke. Discrete clicks *push* (Back undoes them); typing *replaces* (Back doesn't replay keystrokes).
- The text inputs are uncontrolled and remount with a version key only when the URL changes from elsewhere (Back button, “clear all”), so typing never fights a URL round-trip.

### “How is state managed?”

- **Server state** (fetched data) → TanStack Query. The index is immutable per deploy, so `staleTime: Infinity`.
- **Client state** (session, tracker, saved searches) → Zustand with `persist` to `localStorage`.
- **The hydration problem:** static HTML is rendered with no user. If a store loaded `localStorage` *before* React hydrated, the first client render would differ from the HTML and React would throw a hydration error. So the stores use `skipHydration`, rehydrate in an effect after mount, and anything user-specific shows a skeleton until `useHydrated()` is true (`src/lib/hydration.ts`).
- **Cross-tab sync:** a `storage` event listener rehydrates the store when another tab changes it — sign out in one tab, every tab signs out.
- **Pure reducers:** tracker transitions (`src/lib/tracker/reducers.ts`) take `now` as an argument and never mutate, so they're deterministic and unit-tested; the store is a thin wrapper.

### “Your auth runs in the browser — is it secure?”

Be direct: **no, and it can't be.** Anything in the browser is readable and editable by the user. It's labelled a demo in the UI. What it demonstrates:

- **Flows:** sign-up validation (all errors at once), sign-in, session expiry, protected routes with return-to (`?next=`), finishing an interrupted action after login (`?save=<jobId>` saves the job you clicked), onboarding.
- **Hygiene that carries over to real systems:**
  - Passwords hashed with **PBKDF2-SHA256** (100k iterations, per-user random salt) via Web Crypto — never stored in plain text — and compared in **constant time**.
  - **No user enumeration**: the same error whether the email exists or the password is wrong.
  - **Open-redirect guard**: `?next=` only accepts same-site paths (`//evil.com` and `https://…` are rejected) — unit-tested.
  - Export never includes credentials; import validates untrusted JSON before using it.
- **The swap to real auth:** every call goes through `src/lib/auth/service.ts` — async functions returning `{ok, user} | {ok: false, error}`, exactly the shape of an API client. A real backend means rewriting that file to call an API (with HttpOnly session cookies, server-side hashing, rate limiting, CSRF protection) without touching components.

### “What about XSS? You use dangerouslySetInnerHTML.”

Job descriptions are third-party HTML. They're sanitized **once, at build time**, with DOMPurify using a strict allow-list (paragraphs, lists, emphasis, headings, links); every link gets `rel="noopener noreferrer nofollow"`. The browser only ever receives already-cleaned markup. JSON-LD is serialized with `<` escaped so a crafted title can't close the `<script>` tag.

### “How do the three themes work, with no flash?”

- Every color is a CSS custom property with a light and a dark value (`globals.css`), mapped into Tailwind via `@theme inline`. Components never hard-code colors.
- A tiny inline script in `<head>` reads the saved preference and sets `data-theme` on `<html>` **before first paint**. Without it you'd see a flash of the wrong theme on every reload. An e2e test checks the attribute at `DOMContentLoaded`, before React runs.
- “System” listens to `prefers-color-scheme` and follows OS changes live. The hook uses `useSyncExternalStore`, the React-blessed way to read external mutable state.
- Switching themes disables transitions for one frame, so 300 elements don't animate their colors.
- Contrast was *measured*: every text/background token pair meets WCAG AA (4.5:1). The pipeline chart's colors were validated with a palette checker (monotone lightness, distinct steps, contrast against the surface) separately for each theme.

### “What did you do for accessibility?”

- Native `<dialog>` with `showModal()` for modals and sheets: focus trap, Escape, inert background, top layer, all for free.
- Command palette follows the ARIA combobox pattern (`aria-activedescendant`, `role="listbox"`/`option`).
- Drag and drop has a full keyboard/touch alternative (“Move to” menu); moves are announced in a live region.
- Skip link, visible focus rings, labelled controls, `aria-pressed` on toggles, `prefers-reduced-motion` respected.
- **axe-core runs in CI** on 10 pages in both themes and fails the build on serious violations. It caught a real one: the avatar button's name didn't include its visible initials (WCAG 2.5.3 *Label in Name*).

### “How did you think about performance?”

- Every content page is pre-rendered HTML on a CDN — nothing to compute per request.
- The browser downloads a ~125 KB (gzipped) index once and caches it; previews fetch a ~5 KB JSON file per job, cached by TanStack Query.
- Client components are small islands inside server-rendered pages. I noticed passing the full job object (with its description) into those islands serialized the description into the page payload multiple times, so islands receive a summary instead.
- React Compiler handles memoization; search results are memoized on `(index, state)`.
- No image optimizer on a static host, so logos are plain lazy-loaded `<img>` tags with a colored-monogram fallback when one fails.

### “How is it tested?”

- **Unit (Vitest, 128 tests)** — all the pure logic: classifier, skills, salary, text utilities, the whole catalog transform with fixtures, search engine (ranking, facets, filters, sorting, paging), URL params (canonical form, idempotence), match scoring, tracker reducers, password hashing, validation, the open-redirect guard.
- **End-to-end (Playwright, 41 tests)** — against the **production static build** served under the same `/devjobs` base path as GitHub Pages: search and URL behaviour, Back button, preview pane, command palette, sign-up → onboarding, guest-save-through-login, tracker drag-and-drop and menu moves persisting across reloads, notes and undo, themes (no flash), mobile layouts with no horizontal overflow, and axe audits.
- The tests found real bugs during development — e.g. “Software Engineer I” wasn't classified as entry-level (case-sensitive regex), and “CNC Programmer” slipped through as software.

### “What does CI/CD look like?”

`.github/workflows/deploy.yml`: on PRs, pushes to `master`, every 6 hours, and on demand.

1. **quality** — `npm ci`, ESLint (including React Compiler rules), `tsc`, unit tests.
2. **build** — restore the last raw snapshot from the Actions cache, run the pipeline (fresh data on deploys, cached on PRs to spare the API), static export, Playwright + axe, upload the site.
3. **deploy** — `actions/deploy-pages`, only from `master`, never cancelled mid-deploy.

A failure anywhere means the old site stays up.

### “What about SEO?”

Every job and company is a real static page with its own `<title>`, description, canonical URL and Open Graph tags. Jobs carry **schema.org `JobPosting` structured data** (title, description, date, employer, location or `TELECOMMUTE`, salary when known) — what Google for Jobs reads.

---

## Honest limitations (say these before they're asked)

- Accounts are per-browser and not secure (by design, and labelled).
- Search covers the curated snapshot (~800 jobs), refreshed every 6 hours — not the whole upstream API in real time.
- Classification and salary extraction are heuristics: tested, and biased toward dropping rather than mislabelling.
- The export is large on disk (~300 MB, mostly pre-rendered pages and their payloads), but it compresses ~6× and a job page is ~20 KB over the wire.

## What I'd do next

1. Real auth + sync (Supabase or a small API) behind `auth/service.ts` and the tracker store.
2. Saved-search email alerts from the scheduled pipeline run.
3. Inverted index in a Web Worker, or a hosted search engine, if the catalog grows 50×.
4. Persist the classifier's decisions and review the borderline ones to build a labelled dataset.

## Vocabulary to be comfortable with

**SSG / static export** (pages rendered at build time) · **CSR** (rendered in the browser) · **ISR** (re-generating static pages periodically — here emulated by scheduled CI) · **RSC payload** (the serialized React Server Component tree used for client navigation) · **hydration / hydration mismatch** · **disjunctive faceting** · **ETL** · **PBKDF2 / salt / constant-time comparison** · **user enumeration** · **open redirect** · **XSS / sanitization** · **WCAG AA, Label in Name, live regions** · **`useSyncExternalStore`** · **server state vs client state**

## Numbers to remember (from the current build; the About page shows live values)

~4,200 rows fetched · ~800 jobs published · ~130 companies · ~37% with salary · ~26% remote · ~125 KB gzipped search index · ~950 static pages generated in ~10 s · 128 unit tests · 41 e2e tests
