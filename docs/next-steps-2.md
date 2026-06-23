# Next Steps 2 (Post-Review Follow-ups)

These steps follow the completed campaign-page build (roadmap steps 8-14, plus the
post-review fix S15). They cover two groups of work:

1. **Polish / known open issues** carried over from the previous session
   (the "bullet 3" items: seed percentages, cover image, responsive QA).
2. **New requirements** raised after reviewing the live page against fresh
   source material: real "About the Project" content, a broken tab selector,
   a modal donation form, a richer Recent Donations tab, and an Ambassadors
   list.

## Context (current state)

- Astro frontend in `frontend/`. Campaign page at
  `src/pages/the-orange-garden.astro` mounts `SiteLayout` + `CampaignBanner` +
  a single `CampaignTabs` React island (`client:visible`).
- `CampaignTabs.tsx` composes `Tabs.tsx` with 6 inline-React panels
  (`src/components/panels/*`). The donor list (`DonorListIsland.tsx`) and the
  progress + donation form islands live inside this one hydrated tree.
- Donation form (`DonationForm.tsx`) is rendered **inline** in
  `CampaignBanner.astro`, directly on the page (not in a dialog).
- Rails API backend in `backend/` is unchanged and already exposes campaign,
  donations (GET/POST) endpoints. There is **no** ambassadors model/endpoint.

## New source material

- `docs/page-content.html` — the real, full "About the Project" tab content
  (Hebrew source) including story, planned features, NGO description, contact
  details, and a tax-deductibility disclaimer. Authoritative for tab content.
- `screenshots/donors-list.jpg` — the dedicated Recent Donations tab view
  (heading, search box, sort dropdown, list/grid toggle, richer rows).
- `screenshots/ambassadors-list.jpg` — the Ambassadors (לוח שגרירים) tab view
  (ranked ambassador cards: name, raised, goal, progress bar, donor count).

## Constraints (unchanged)

- Content is in English (translate the Hebrew sources; mirror structure).
- No payment processing; the form only creates a `pending` donation.
- No new backend model unless a step explicitly scopes it. Ambassadors data is
  **not** modeled — keep it static/placeholder unless a step says otherwise.
- Reuse existing palette CSS vars from `SiteLayout.astro`
  (`--accent-magenta`, `--accent-magenta-bright`, `--progress-green`,
  `--heart-orange`, `--text`, `--text-muted`, `--border`).

## Toolchain note

The system `/usr/bin/rails` is a broken Ruby 2.6 stub. For every Rails command
prefix PATH:

```
PATH="/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH" bin/rails ...
```

Astro: verify with `npm run build` in `frontend/`. Because hydration bugs do not
always fail the build, also run the dev server and check the page in a browser
for any step touching islands (S17, S18, S19, S20).

---

## Step: S16

Title: Replace About-the-Project copy with the real page content
Intent: Make the "About the Project" tab faithfully reflect the authoritative
source instead of the current condensed paraphrase.
Affected Area: Frontend / `src/components/panels/AboutProjectPanel.tsx` (and
possibly a new "About the NGO" alignment).
Dependencies: None.

In Scope:
- Read `docs/page-content.html` and translate its content to English, mirroring
  the source structure:
  - The headline/dedication ("Join now and become a founder of The Orange
    Garden" / in memory of Shiri, Ariel, and Kfir Bibas and all children of
    October 7).
  - The full story (20 dunams; therapeutic gardening; fruit orchards;
    ecological stream; memorial space; Orange Omega; Wishing Wall; picnic
    areas; amphitheater; outdoor library; etc.).
  - The partners/municipality/plans-ready section and the Ofri Bibas quote.
  - The NGO (Venatata) description block: national environmental movement,
    "Adam - Adama - Kehila" model, Israel Earth Prize 2023, the "Adamot
    Bracha" project, NGO number 580689537.
  - NGO contact details (email info@venatata.org, phone 052-8622966 / corporate
    054-2370949, website venatata.org) and the "Go to NGO page" link
    (placeholder href).
  - The tax-deductibility disclaimer ("Did you know?" — donations may be tax
    deductible in IL/US/CA/UK per the site terms).
- Decide split between the "About the Project" and "About the NGO" panels: the
  NGO description + contact + disclaimer naturally belong in the "About the NGO"
  panel; keep the project story in "About the Project". Update both panels
  accordingly (`AboutProjectPanel.tsx`, `AboutNgoPanel.tsx`).

Out of Scope:
- Rendering the raw Hebrew or the source's CSS-module class names.
- Embedding the source's `active_storage` image URLs verbatim (use a
  placeholder image, or omit images — see S22 for cover image).
- Any data/API wiring.

Acceptance Criteria:
- The "About the Project" tab shows the full English story matching
  `docs/page-content.html` (no missing major sections vs. the source).
- NGO description, contact details, and tax disclaimer appear (in the NGO panel),
  in English.
- `npm run build` passes; content renders in the correct tabs.

Implementation Notes
- Source file: `docs/page-content.html` (lines 4-96 cover the project/NGO copy;
  lines 99-131 cover contact details + disclaimer + NGO-page link).
- The "Go to NGO page" link should be a non-interactive placeholder, consistent
  with the existing chrome convention.

Source Trace
- `docs/page-content.html`; roadmap constraint "Content is in English".

---

## Step: S17

Title: Fix tab selection (tabs do not switch)
Intent: Make the 6-tab selector actually change the visible panel on click.
Affected Area: Frontend / `src/components/Tabs.tsx` (and possibly
`CampaignTabs.tsx` / page mount).
Dependencies: None. (Should land before/with S18-S20 which depend on working
tabs.)

In Scope:
- Reproduce and diagnose the bug: clicking a tab does not show its panel.
  Likely causes to investigate, in order:
  1. The island is not hydrating (confirm the `CampaignTabs` `astro-island`
     hydrates client-side; `client:visible` requires the element to enter the
     viewport — if the tabs are below the fold or zero-size at load, hydration
     may be delayed/never fire; consider `client:load`).
  2. Panel visibility relies on the HTML `hidden` attribute
     (`Tabs.tsx` uses `hidden={!isActive}`), which can be overridden by any CSS
     setting `display`/`visibility` on `.tabs__panel` (e.g. the page-scoped
     `.tabs-section :global(.tabs__panel)` rules). Verify `hidden` is honored;
     if overridden, switch to an explicit conditional render or a class-based
     `display:none` toggle that wins.
  3. `onClick`/state wiring (`setActiveId`) actually updates and re-renders.
- Implement the minimal fix that makes tab switching work and keeps the active
  underline in sync.

Out of Scope:
- Redesigning the tab API or restyling beyond what the fix requires.
- The content of individual panels (other steps).

Acceptance Criteria:
- Clicking any of the 6 tabs shows that tab's panel and hides the others.
- The magenta active underline tracks the selected tab.
- The Recent Donations tab, once selected, shows the live donor island
  (i.e. the nested island hydrates).
- Verified in a browser (not just `npm run build`).

Implementation Notes
- Files: `src/components/Tabs.tsx`, `src/components/CampaignTabs.tsx`,
  `src/pages/the-orange-garden.astro` (mount directive).
- If the cause is `hidden` being overridden by CSS, prefer conditional
  rendering of the active panel or a dedicated `.tabs__panel--hidden { display:
  none !important }` class over relying on the bare `hidden` attribute.

Source Trace
- Reported defect: "Tabs interaction (selection) currently doesn't work";
  `src/components/Tabs.tsx` (`hidden={!isActive}`), page-scoped panel CSS in
  `src/pages/the-orange-garden.astro`.

---

## Step: S18

Title: Move the donation form into a modal/dialog
Intent: The donation form should open in a popup triggered by the "Donate" CTA,
instead of sitting inline on the page.
Affected Area: Frontend / `CampaignBanner.astro`, `DonationForm.tsx`, possibly a
new `DonationDialog.tsx` island.
Dependencies: S17 only loosely (independent island); can proceed in parallel.

In Scope:
- Wrap `DonationForm` in a modal/dialog so it is hidden by default and opens
  when the user clicks a "Donate" button.
- Wire the banner's "Donate" CTA (currently an inert placeholder span in
  `CampaignBanner.astro` after S15) to open the dialog. Because the banner is
  Astro and the form is a React island, implement the trigger + dialog as a
  single React island (e.g. `DonationDialog.tsx`) that renders the "Donate"
  button and the modal-hosted `DonationForm`, mounted in the banner with a
  client directive. The header "Donate" CTA can remain a placeholder, or also
  open the dialog if cheap — but at minimum the banner CTA opens it.
- Use the native `<dialog>` element (`showModal()`/`close()`) or an accessible
  custom modal: focus trap is a nice-to-have, but at minimum support
  open/close, close on backdrop click and Escape, and a visible close button.
- Preserve all existing form behavior: presets/custom amount, frequency,
  display mode, donor name (required unless anonymous), dedication, submit ->
  pending donation, post-submit invalidation of progress + donors, and the
  loading/error/422 states.
- On successful submit, keep the success acknowledgement; optionally
  auto-close the dialog after success (or show success inside it).

Out of Scope:
- Payment/checkout.
- Changing the form fields or validation logic (only its container/placement).

Acceptance Criteria:
- The donation form is not visible on initial page load.
- Clicking the banner "Donate" CTA opens the form in a modal/dialog.
- The modal closes via a close button, backdrop click, and Escape.
- Submitting still creates a pending donation and refreshes progress + donors
  (shared QueryClient invalidation still works from inside the dialog).
- Verified in a browser; `npm run build` passes.

Implementation Notes
- Files: new `src/components/DonationDialog.tsx` (or fold the dialog into
  `DonationForm.tsx`), `src/components/CampaignBanner.astro` (mount the dialog
  island where the inline form is now, and wire the CTA).
- The form already wraps itself in `QueryProvider` using the shared singleton
  client (`src/lib/queryClient.tsx`), so invalidation continues to work inside
  a modal.
- Prefer native `<dialog>` for built-in Escape/backdrop semantics and focus
  handling.

Source Trace
- Reported requirement: "Payment form should be inside the dialog/modal/popup";
  current inline mount in `src/components/CampaignBanner.astro`.

---

## Step: S19

Title: Build the full Recent Donations tab (search, sort, richer rows)
Intent: Make the Recent Donations tab match `donors-list.jpg`, beyond the
current simple list.
Affected Area: Frontend / `DonorListIsland.tsx`,
`src/components/panels/RecentDonationsPanel.tsx`.
Dependencies: S17 (so the tab is selectable to verify).

In Scope:
- Reproduce the `donors-list.jpg` layout in English/LTR:
  - A panel heading ("Recent Donations").
  - A search input (filters the donor list by name) — placeholder text
    "Search".
  - A "Sort by" dropdown with at least "Most recent" (default); optionally
    "Highest amount". Sorting/filtering happens client-side over the fetched
    donations.
  - A list/grid view toggle (the two-icon control at the left in the
    screenshot) — at minimum render the toggle; the list view is required, the
    grid view may be a lighter variant or a non-functional placeholder if time
    is short (note in README).
  - Rows showing donor name, ₪ amount, and relative time (the current
    `DonorListIsland` row content is close; restyle to match the
    card/divided-row look).
- Keep consuming the existing API (`GET /api/campaigns/the-orange-garden/
  donations`) via React Query; do search/sort on the client over that data.
- Preserve loading/error/empty states.

Out of Scope:
- Server-side search/sort/pagination (client-side over the existing newest-20
  is sufficient).
- New backend endpoints or query params.

Acceptance Criteria:
- The Recent Donations tab shows a heading, a working search box (filters by
  name), a sort dropdown (at least "Most recent"), and a list of donation rows
  (name, ₪ amount, relative time) resembling `donors-list.jpg`.
- A list/grid toggle is present (list view functional).
- Live data still loads from the API; loading/error/empty states intact.
- Verified in a browser; `npm run build` passes.

Implementation Notes
- Files: `src/components/DonorListIsland.tsx` (add search/sort/toggle state +
  richer markup), `src/components/panels/RecentDonationsPanel.tsx` (heading/
  layout wrapper).
- Search/sort are derived client-side from the `useQuery` result; no API
  changes.

Source Trace
- `screenshots/donors-list.jpg`; existing `DonorListIsland.tsx` and the
  donations API in `docs/next-steps.md` ("Already done").

---

## Step: S20

Title: Build the Ambassadors tab list (cards with progress)
Intent: Make the "Ambassador Leaderboard" tab match `ambassadors-list.jpg`
instead of the current plain Hebrew table.
Affected Area: Frontend /
`src/components/panels/AmbassadorLeaderboardPanel.tsx`.
Dependencies: S17 (so the tab is selectable to verify).

In Scope:
- Reproduce the `ambassadors-list.jpg` layout in English/LTR:
  - A heading ("Ambassadors") and a count line ("59 ambassadors").
  - A search box and a "Sort by / Most donations" dropdown (client-side over
    the static data) and the list/grid toggle, mirroring the donors tab
    controls — keep these consistent with S19's controls where practical.
  - Ranked ambassador **cards** (not a bare table): rank + name, raised amount
    (green), goal where present, a green/gray progress bar for ambassadors that
    have a goal, and a donor count with a person icon.
- Translate the existing sample names to English (or transliterate) and keep the
  amounts/goals/donor counts from the current static data (which already matches
  the reference top-7). This stays **static placeholder data** — no backend
  model.

Out of Scope:
- A real ambassadors model / API / endpoint (explicitly out of scope per
  roadmap "No organization model"). If a real backend is ever desired, that is
  a separate, larger step.
- Per-ambassador detail pages or joining as an ambassador (placeholder only).

Acceptance Criteria:
- The Ambassadors tab shows a heading + count, search/sort/toggle controls, and
  ranked ambassador cards with name, raised (green), goal, a progress bar where
  a goal exists, and a donor count with icon — resembling
  `ambassadors-list.jpg`.
- Content is English/LTR; data remains static.
- Verified in a browser; `npm run build` passes.

Implementation Notes
- File: `src/components/panels/AmbassadorLeaderboardPanel.tsx` (replace the
  RTL Hebrew table with English cards + progress bars). Reuse the
  `--progress-green` palette var for the bars.
- Source data already present in that file (top 7 from
  `docs/page-example-content.md` Tab 3); the screenshot shows ranks 1-5.

Source Trace
- `screenshots/ambassadors-list.jpg`; existing
  `src/components/panels/AmbassadorLeaderboardPanel.tsx`;
  `docs/page-example-content.md` Tab 3.

---

## Step: S21

Title: Fix seed amounts so progress reflects the reference (~21%)
Intent: Make the live progress bar/percent resemble the reference instead of a
tiny fractional value.
Affected Area: Backend / `backend/db/seeds.rb`.
Dependencies: None.

In Scope:
- Adjust seeded donation amounts (and/or count) so the campaign's computed
  `progress.percent` is roughly the reference ~21% of the ₪5,000,000 goal,
  i.e. raised ≈ ₪1,000,000-1,070,000, with a believable donor count.
- Keep a handful of varied donations (named / first-name / anonymous; with and
  without dedications) so the donor list still looks realistic.

Out of Scope:
- Schema or model changes; new endpoints.

Acceptance Criteria:
- After `bin/rails db:seed`, `GET /api/campaigns/the-orange-garden` returns a
  `progress.percent` close to the reference (~21%), and the banner bar/heart
  render at a believable fill.

Implementation Notes
- File: `backend/db/seeds.rb`.
- Recall amounts are in cents; percent is computed server-side from
  raised/goal.

Source Trace
- Prior open issue (S10 follow-up): "seeded percent is small/fractional vs the
  screenshot's 21%"; `screenshots/campaign-banner.png`.

---

## Step: S22

Title: Add a real cover image to the banner
Intent: Improve resemblance to the reference by showing a cover image instead of
a placeholder.
Affected Area: Frontend / `CampaignBanner.astro` (and optionally the seeded
`cover_image_url`).
Dependencies: None.

In Scope:
- Render a cover image in the banner (the `Campaign` model already has
  `cover_image_url`). Either use that field from the API or a bundled asset in
  `frontend/public/`.
- Ensure the image is responsive and does not break the banner layout.

Out of Scope:
- An image gallery / carousel.
- Sourcing copyrighted assets — use a neutral placeholder or a provided asset.

Acceptance Criteria:
- The banner shows a cover image that scales cleanly on mobile and desktop.
- `npm run build` passes.

Implementation Notes
- File: `src/components/CampaignBanner.astro`; optionally seed a
  `cover_image_url` in `backend/db/seeds.rb`.

Source Trace
- Prior open issue (bullet 3): cover image; `Campaign.cover_image_url` exists.

---

## Step: S23

Title: Responsive + visual QA against the four screenshots
Intent: Confirm the assembled page resembles the reference at mobile and desktop
widths and fix obvious breakages.
Affected Area: Frontend / scoped styles across layout/banner/tabs/panels.
Dependencies: S16-S22 (QA the finished result).

In Scope:
- Check header, banner (amount, progress bar + heart, goal, donors, donate
  dialog trigger, share row), tabs (selection + underline), donors tab,
  ambassadors tab, and footer at mobile and desktop widths.
- Fix obvious overflow/wrap/spacing/contrast issues; keep changes minimal and
  scoped.

Out of Scope:
- Pixel-perfect matching; production hardening.

Acceptance Criteria:
- The page is coherent and clearly resembles the screenshots at common mobile
  and desktop widths, with no broken layouts.
- `npm run build` passes.

Source Trace
- Prior open issue (bullet 3): responsive/visual QA;
  `screenshots/{header,campaign-banner,tabs-selector,footer}.png`,
  `screenshots/{donors-list,ambassadors-list}.jpg`.

---

## Dependency order

```
S16 (about content) ─┐
S21 (seed %) ─────────┤
S22 (cover image) ────┤
S17 (tabs fix) ─┬─ S19 (donors tab) ─┐
                ├─ S20 (ambassadors) ─┤
S18 (modal) ────┴─────────────────────┴─> S23 (responsive/visual QA)
```

- S16, S21, S22 are independent and can be done any time / in parallel.
- S17 (tab fix) should land before S19 and S20 so those tabs are verifiable.
- S18 (modal) is an independent island change; can run in parallel with S17.
- S23 is the final QA pass over the finished page.
