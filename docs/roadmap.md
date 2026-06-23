# Roadmap

## Architecture

- Build a Rails API backend with SQLite.
- Build an Astro frontend that serves the campaign page.
- Use React islands inside Astro for dynamic donation/progress/donor UI.
- Use React Query for API fetching, cache invalidation, and post-submit refresh.
- Keep deployment out of scope for this planning phase.

## Constraints

- Content is in English.
- No organization model.
- No payment processing.
- No user accounts, login, admin, or production hardening.
- Campaign/story content lives in Astro, not in the database.
- Campaign ID can be hard-coded in the frontend for this assignment.

## Data Model

### Campaign

- `id`
- `slug`
- `title`
- `goal_cents`
- `currency`
- optional `cover_image_url`

### Donation

- `id`
- `campaign_id`
- `amount_cents`
- `frequency` (`one_time`, `recurring`)
- `display_name_mode` (`full_name`, `first_name`, `anonymous`)
- `donor_name`
- `dedication`
- `status` (`pending`)
- timestamps

## API

- `GET /api/campaigns/:id`
  - Returns campaign metadata and calculated progress.
- `GET /api/campaigns/:id/donations`
  - Returns recent donations.
- `POST /api/campaigns/:id/donations`
  - Creates a pending donation.
  - Returns the created donation and updated campaign progress.

## Execution Plan

1. Scaffold Rails API app with SQLite.
2. Add `Campaign` and `Donation` models.
3. Add migrations and validations.
4. Seed one campaign and several donations.
5. Implement campaign and donation API endpoints.
6. Add request/model tests for core API behavior.
7. Scaffold Astro frontend.
8. Create the static campaign page with English content.
9. Add layout, tabs, cover image area, progress section, and donation panel.
10. Add React Query setup.
11. Build React islands for campaign progress, donor list, and donation form.
12. Wire donation submit to Rails API.
13. Refresh progress and donor data after successful submission.
14. Add basic loading, error, and validation states.
15. Write README with setup, decisions, trade-offs, future work, and payment-provider plan.

## Payment Plan For README

- Real payment flow would create a donation in `pending`.
- Backend would initialize checkout with a payment provider.
- Provider webhook would verify payment status.
- Successful webhook would transition donation from `pending` to `paid`.
- Failed or expired payment would leave it pending or mark it failed.
- In production, campaign progress should count only `paid` donations.

## Main Trade-Off

Using Astro keeps rich campaign content static and simple, while Rails focuses on the backend behavior the assignment cares about: data modeling, validation, persistence, and donation submission. The cost is a slightly more complex two-app setup, but it is acceptable here because deployment is explicitly out of scope for now.
