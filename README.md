# Jgive Campaign Donation Page

Small Rails + Astro implementation of the donor-facing part of a Jgive campaign page.

- Live app: <https://jgive.miskamyasa.me>
- Campaign page: <https://jgive.miskamyasa.me/the-orange-garden>
- Reference assignment: [docs/jgive-backend-home-assignment.md](docs/jgive-backend-home-assignment.md)

## What This Builds

The app recreates a campaign donation page for **The Orange Garden** in English.

It includes:

- Campaign cover, title, story, project details, progress, and tabbed content.
- Recent donations and donor display rules.
- Donation form with preset/custom amounts, one-time/recurring choice, donor display preference, and optional dedication.
- Rails API persistence for pending donations.
- Immediate progress/donor refresh after a donation is submitted.

Payment processing is intentionally not implemented.

## Stack

- Backend: Rails 8 API, SQLite, Minitest.
- Frontend: Astro, React islands, React Query.
- Data model: `Campaign` and `Donation`.

## Local Setup

Backend:

```sh
cd backend
bundle install
bin/rails db:prepare
bin/rails db:seed
bin/rails server -p 3000
```

Frontend:

```sh
cd frontend
npm install
PUBLIC_API_BASE_URL=http://localhost:3000 npm run dev
```

Then open the Astro dev URL and visit `/the-orange-garden`.

## API

```txt
GET  /api/campaigns/the-orange-garden
GET  /api/campaigns/the-orange-garden/donations
POST /api/campaigns/the-orange-garden/donations
```

Donation create body:

```json
{
  "donation": {
    "amount_cents": 18000,
    "frequency": "one_time",
    "display_name_mode": "full_name",
    "donor_name": "Ada Lovelace",
    "dedication": "In honor"
  }
}
```

## Main Decisions

This project uses a **Rails API + Astro frontend** split because my day-to-day strength is frontend work.

Astro made it easier to build a polished campaign page without spending the assignment budget on Rails views, ERB, rich-text rendering, or HTML sanitization. Rails still handles the backend responsibilities the assignment cares about: data models, SQLite persistence, validations, donation creation, and campaign progress.

It did not seem realistic to learn all the Rails corners in several hours. I could spend that time trying, but I doubt it would get much further than syntax-level familiarity while also finishing the assignment well.

**SQLite** was enough for this assignment and kept the backend setup simple.

The data model is intentionally small: only **Campaign** and **Donation**. The assignment does not need organizations, users, admin, or login.

The campaign story/content is **static English content in Astro**. The original page is Hebrew and content-heavy, but English was simpler to work with and easier to review.

**React islands with React Query** handle the dynamic parts: donation form, progress, and donor list. This matches how I usually build frontend interactions.

I am happy to discuss the trade-offs behind these choices. There were many possible branches: vanilla JS instead of React, Next.js instead of Astro, Rails views instead of an API/frontend split, PostgreSQL instead of SQLite, Hebrew instead of English, and different visual/design changes.

Overall, Rails is focused on backend behavior, while Astro/React handles the frontend experience. That matches my strengths while still covering the Rails requirements.

## Payment Plan

The current app creates every donation in `pending` state and updates the page immediately, because the assignment asks for progress to change after form submission.

For real payment processing, I would:

1. Create the donation as `pending`.
2. Initialize checkout with a payment provider.
3. Redirect the donor to hosted checkout or show the provider payment UI.
4. Verify provider webhooks on the backend.
5. Move the donation from `pending` to `paid` after a verified successful payment.
6. Mark failed or expired payments separately.
7. Count only `paid` donations toward production campaign progress.

## Known Trade-Offs

- CORS is permissive for the assignment setup and should be restricted for production.
- Campaign content is static in Astro, not editable through an admin UI.
- Ambassadors/groups are frontend presentation only; there is no backend model for them.
- Payment, auth, admin, and production hardening are intentionally out of scope.

## Tests

Backend tests cover the model validations and API behavior.

```sh
cd backend
bin/rails test
```

Frontend build check:

```sh
cd frontend
npm run build
```

## AI Usage

AI was used for planning, implementation support, review, and documentation. Session transcripts are included in [ai-sessions](ai-sessions).
