# Next Steps (Postponed Work)

These steps were deliberately deferred from the current session, which stopped at
the static Astro campaign page (roadmap step 8). They correspond to roadmap.md
steps 9-15 plus the mandatory deployment follow-up.

## Already done (context for these steps)

- Rails 8.1.3 API-only backend in `backend/` (SQLite), with `Campaign` and
  `Donation` models, validations, seeds, and tests.
- API endpoints (consume these from the frontend):
  - `GET /api/campaigns/:id` (`:id` accepts the slug or numeric id) -> campaign
    metadata + computed `progress { raised_cents, donor_count, percent }`.
  - `GET /api/campaigns/:id/donations` -> recent donations (newest first, limit
    20), each with a server-masked `display_name`.
  - `POST /api/campaigns/:id/donations` -> creates a `pending` donation; returns
    `{ donation, progress }` on 201, `{ errors }` on 422.
  - POST body shape: `{ "donation": { amount_cents, frequency,
    display_name_mode, donor_name, dedication } }`.
- Astro frontend in `frontend/` with `@astrojs/react` and
  `PUBLIC_API_BASE_URL` env support; static English page at
  `src/pages/the-orange-garden.astro` (route `/the-orange-garden`).
- Canonical campaign slug: `the-orange-garden` (hard-code this in the frontend).

## Toolchain note

The system `/usr/bin/rails` is a broken Ruby 2.6 stub. For every Rails command
prefix PATH:

```
PATH="/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH" bin/rails ...
```

For the Astro dev server, use background mode:
`astro dev --background` (manage with `astro dev stop|status|logs`).

---

## Step: S8

Title: Add layout: tabs, cover image area, progress section, donation panel
Intent: Establish the page structure mirroring the reference tabbed layout.
Affected Area: Frontend / layout + components (static shell).
Dependencies: S7 (done).

In Scope:
- Layout with tabs (mirroring reference tabs: About the Project, Recent
  Donations, etc.), cover image area, a progress section placeholder, and a
  donation panel placeholder.
- Resemble (not pixel-perfect) the reference design.

Out of Scope:
- Hooking placeholders to live data (S10-S11).
- Tabs whose data isn't modeled (ambassadors/groups) may be static or omitted;
  if changed, note in README.

Acceptance Criteria:
- Tabbed layout renders with cover image, progress region, and donation panel
  regions present.
- Tab navigation works (client-side toggle).

Source Trace
- Roadmap Execution Plan step 9; reference tabs in `docs/page-example-content.md`.

---

## Step: S9

Title: Add React Query setup
Intent: Provide the data-fetching/caching layer used by all dynamic islands.
Affected Area: Frontend / React island infrastructure.
Dependencies: S6 (done).

In Scope:
- Install React Query; create a `QueryClient` + provider wrapper usable inside
  Astro islands.
- A small API client module (base URL from `PUBLIC_API_BASE_URL`, campaign slug
  hard-coded to `the-orange-garden`).

Out of Scope:
- The island UIs themselves (S10-S11).

Acceptance Criteria:
- A React island can run a `useQuery` against the Rails API and render results.
- Cache invalidation primitives are available for post-submit refresh.

Implementation Notes
- Astro islands do not share a single React tree by default; provide the
  `QueryClient` per island root (or use one combined island).

Source Trace
- Roadmap line 8 (React Query for fetching/invalidation/refresh); Execution Plan
  step 10.

---

## Step: S10

Title: Build progress + donor-list islands
Intent: Render live campaign progress and recent donors from the API.
Affected Area: Frontend / React islands.
Dependencies: API endpoints (done), S8, S9.

In Scope:
- Progress island: fetch `GET /api/campaigns/the-orange-garden`, show
  raised/goal, percent bar, donor count.
- Donor list island: fetch `GET /api/campaigns/the-orange-garden/donations`,
  render names (already masked server-side), amounts, dedications.

Out of Scope:
- Submission (S11).

Acceptance Criteria:
- Progress bar reflects API-computed progress.
- Donor list shows seeded donations with correct display-name handling and
  recent ordering.

Implementation Notes
- Consume the exact JSON field names from the existing API (see "Already done").

Source Trace
- Roadmap lines 7, 45-48; Execution Plan step 11.

---

## Step: S11

Title: Build donation form island + wire submit + post-submit refresh
Intent: Let donors submit a pending donation and immediately see updated
progress/donors.
Affected Area: Frontend / React island (form) + API integration.
Dependencies: API endpoints (done), S9, S10.

In Scope:
- Form fields: amount (preset options + custom), one_time vs recurring, display
  preference (full_name/first_name/anonymous), optional dedication, donor name.
- Submit via `POST /api/campaigns/the-orange-garden/donations` (React Query
  mutation), using the body shape `{ "donation": { ... } }`.
- On success, invalidate/refetch progress + donor queries.

Out of Scope:
- Payment/checkout redirect.

Acceptance Criteria:
- Submitting creates a `pending` donation server-side.
- Progress + donor list refresh automatically after a successful submit.
- Field values map correctly to the API enums.

Implementation Notes:
- Preset amounts can mirror common reference values (e.g. 50/100/180/360 ILS).

Source Trace
- Assignment form spec; Execution Plan steps 12-13; roadmap line 8 (refresh).

---

## Step: S12

Title: Add loading, error, and validation states
Intent: Make the dynamic UI robust for empty/slow/failed/invalid cases.
Affected Area: Frontend / all islands (S10, S11).
Dependencies: S10, S11.

In Scope:
- Loading indicators for queries/mutation.
- Error UI for failed fetch/submit.
- Client-side + server-error (422) validation display on the form.

Out of Scope:
- Production hardening.

Acceptance Criteria:
- Slow/failed API states render gracefully (no blank/broken UI).
- Invalid form submissions surface field-level errors (including server 422s).

Source Trace
- Roadmap Execution Plan step 14.

---

## Step: S13

Title: Write README (setup, decisions, trade-offs, future work, payment plan)
Intent: Document how to run both apps and explain key choices.
Affected Area: Repo root / `README.md`.
Dependencies: S1-S12.

In Scope:
- Local setup for both Rails and Astro (install, migrate, seed, run; env/base
  URL; the Rails PATH toolchain note above).
- Key decisions/trade-offs (two-app Astro+Rails split; English content choice;
  any design changes vs the reference).
- Future work + the pending->paid payment-provider plan.

Out of Scope:
- The transcript/notes deliverables (author-provided, not code).

Acceptance Criteria:
- README enables a clean local run of both apps end-to-end.
- Payment section describes: create-pending -> checkout init -> webhook verify
  -> pending->paid, and that production counts only `paid` donations toward
  progress.

Source Trace
- Roadmap Execution Plan step 15; payment plan (roadmap lines 71-78); main
  trade-off (roadmap lines 80-82); assignment deliverables.

---

## Step: S14 (follow-up, outside roadmap planning scope)

Title: Deploy a live application
Intent: Satisfy the mandatory live-deployment deliverable.
Affected Area: Backend + frontend hosting.
Dependencies: S1-S13.

In Scope:
- Deploy the Rails API and the Astro frontend; wire the frontend's
  `PUBLIC_API_BASE_URL` to the deployed API.
- Provide a public URL.

Out of Scope:
- Production hardening beyond what hosting requires.

Acceptance Criteria:
- A reachable public URL serves the campaign page and the page can submit a
  pending donation against the deployed API.

Source Trace
- Assignment deliverable: "A deployed, live application (mandatory)." Roadmap
  line 9 explicitly excluded deployment from the planning phase, so it is a
  post-plan follow-up.

---

## Dependency order

```
(done: S1-S7) -> S8 ----\
              -> S9 -----> S10 -> S11 -> S12 -> S13 -> S14
```

- S8 and S9 can proceed in parallel after the static page (S7).
- S10 needs the API (done) + S8 + S9.
- S11 needs S9 + S10. S12 hardens S10/S11.
- S13 documents the finished system; S14 deploys it.
