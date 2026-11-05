# Verification record — 5 November 2026

## What was verified, and how

The workspace used to build this release had no access to the npm registry, so the full Next.js app could not be installed or built there. Checks were done as follows.

### Database and security (run against the live `preema-aviation` Supabase project)
| Check | Result |
|---|---|
| Submitting each inquiry type (flight, holiday, visa, hotel, package, corporate, contact) through `submit_inquiry` | Saved, each with a unique `PA-XXXX-XXXX` reference |
| Wrong or missing server secret | Rejected (`unauthorized`) |
| Same form submission sent twice (same idempotency key) | Same reference returned, no duplicate record |
| Invalid type / too-short name | Rejected (`invalid`), nothing saved |
| Rate limit: 6th inquiry from one hashed IP within 10 minutes | Rejected (`rate_limited`) |
| Package context from a published package | Linked to the package and its destination; label stored |
| Package context pointing at a **draft** package | Not linked (drafts can't be referenced) |
| Anonymous role reading `inquiries` | Permission denied |
| Anonymous role reading packages | Published only; drafts hidden |
| Uninvited sign-up | Blocked ("Sign-up is by invitation only") |
| Invited sign-ups | Staff profiles created with the invited role |
| Consultant: view inquiries, change status, assign, add note | Allowed; history logged automatically (created → status_changed → assigned → note_added) |
| Consultant: edit customer's submitted data | Blocked |
| Consultant: read private settings, edit site settings, create packages, forge history events | Blocked / no rows |
| Consultant promoting themself to admin | Blocked (bug found and fixed in migration 0004) |
| Admin editing content and reading private settings | Allowed |
| Last active admin demoting themself | Blocked |
| Deactivated staff member | Sees no inquiries |
| Signed-in non-staff user | Sees no inquiries |
| Package with a fixed price but no amount | Rejected by a database constraint |
| Dashboard figures (`inquiry_stats`) | Computed from stored rows |

Test records were deleted afterwards. The production database now holds only the starter content.

### Application code
- TypeScript type check of all `src/` files against the real `zod` 3.25.76 and Node types, with the framework packages stubbed. No errors other than ones caused by the stubs. This catches syntax errors and mistakes in the app's own types; it does not fully check Next.js or Supabase API usage.
- All validation rules run against 11 sample submissions (valid flight, return before departure, past date, infants above adults, single-leg multi-city, "Help me choose", missing destination, check-out before check-in, rooms above guests, corporate without e-mail, invalid phone without consent, honeypot filled). Every one behaved as expected.
- `globals.css` compiled successfully with Tailwind CSS 4.

## Still to verify after `npm install` (please run once)

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Then walk through:
1. Submit each inquiry type from `/plan-your-trip`, a package page and a destination page. Check that the reference appears only after saving.
2. Leave required fields empty or enter inconsistent dates; check the inline messages and that the focus moves to the first error.
3. Stop the network in DevTools and submit; check the error message and that your entries stay in the form.
4. Sign in as admin: the inquiry appears, and assign, status, notes and CSV export work.
5. Sign out and open `/admin/inquiries`: you are redirected to the login page.
6. Mobile width (375px): the menu opens and closes (Escape closes it), the forms and filters work, and the WhatsApp dialog behaves (once a verified number is set).
