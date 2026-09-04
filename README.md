# DevJobs

A full-stack job board built to practice production Next.js patterns for real — not a tutorial clone. Every feature below was chosen to force an actual engineering decision: rendering strategy, data-fetching boundaries, cache invalidation, route protection.

**Live demo:** [add Vercel URL after deploy]
**Repo:** https://github.com/iabolfazl83/devjobs

## Features

- Job listings from [The Muse](https://www.themuse.com/developers/api/v2) public API
- Job detail pages with sanitized HTML rendering (`isomorphic-dompurify`) before `dangerouslySetInnerHTML`
- Save / unsave jobs backed by a real SQLite database (`better-sqlite3`), parameterized queries throughout
- Shared React Query cache — save state stays in sync across every job card from a single underlying request, not one request per card
- Client-side keyword filter (Zustand) scoped to the currently loaded page of results
- Middleware-gated `/saved` route with return-URL redirect after login
- Dedicated error boundaries and 404 pages (route-level and global), not generic fallbacks

## Rendering strategy

| Route | Strategy | Why |
|---|---|---|
| `/jobs` | ISR (revalidate every 5 min) | Listings don't need to be real-time; avoids hitting the upstream API on every request |
| `/jobs/[id]` | SSR (fetched per request) | Detail pages are viewed far less often than the list; simplicity wins over caching here |
| `/saved` | SSR, reads the local DB directly | No client-side round trip needed for the initial render — it's the same server |

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · TanStack React Query · Zustand · better-sqlite3 · isomorphic-dompurify

## Known, deliberate limitations

- **Auth is intentionally fake** (a presence-only session cookie, no signature verification). This project's scope was routing and data-fetching patterns, not credential security — real authentication is planned as its own, separate, focused project.
- **Search only filters what's already loaded.** The Muse's public API has no server-side search parameter, so this isn't a full-catalog search — it's scoped to page 0 of results, and that's intentional, not hidden.
- **Saved jobs live in SQLite on the server's local filesystem.** On serverless hosting this resets on redeploy. A persistent hosted database (e.g. Turso) is the natural next step before this needs to hold real data long-term.
- No automated tests yet.

## Running locally

```bash
git clone https://github.com/iabolfazl83/devjobs.git
cd devjobs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What I'd build next

- Real authentication (credential verification, signed sessions) — swapping out the fake cookie check
- Move SQLite to a hosted, persistent database
- Optimistic UI updates on save/unsave, instead of waiting on the round trip
- Automated tests for the API routes