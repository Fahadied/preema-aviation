# Preema Aviation — website and inquiry system

An inquiry-based travel website for Preema Aviation (Siddheshwari, Dhaka), with a secure admin panel for staff.

- **Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Supabase (Postgres, Auth, Storage), optional Resend for staff e-mails, Vercel-ready.
- **What it is:** a site that collects structured travel inquiries (flights, holidays, visa assistance, hotels, packages, destinations, corporate/NGO, general contact) and a staff workspace to manage them and the website content.
- **What it is not (yet):** live fares, instant ticketing, hotel inventory or online payment. Nothing on the site simulates them, and no inquiry is ever presented as a booking.

---

## 1. Project layout

```
src/
  app/(site)/…            public pages (home, about, services, destinations, packages, corporate, contact, FAQ, policies, plan-your-trip)
  app/admin/…             login / signup / password reset and the staff panel (/admin)
  app/api/inquiries       POST endpoint that validates and stores inquiries
  components/             UI, inquiry forms, admin UI
  lib/                    data access, validation (zod), auth helpers, e-mail, formatting, i18n strings
supabase/migrations/      database schema, security policies and production starter content (run in order)
supabase/seed/demo.sql    DEVELOPMENT-ONLY demo packages (never run on production)
public/brand/             official Preema logo files (replace to update the logo)
docs/                     content guide, verification record, outstanding items
```

## 2. Environment variables

Copy `.env.example` to `.env.local` (development) and set the same variables in Vercel (Production and Preview).

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL without trailing slash. Used for canonical URLs, sitemap, structured data and auth e-mail links. |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Project Settings → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | The publishable (or legacy anon) key. Safe in the browser — Row Level Security protects private data. |
| `INQUIRY_SUBMIT_SECRET` | yes | Server-only. Authorises the website to store inquiries. Must match the value registered in the database (see §3.3). |
| `IP_HASH_SALT` | yes | Server-only random string used to hash visitor IPs for rate limiting. |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | optional | Staff e-mail notifications. Without them, inquiries are still saved and the failure is recorded. |
| `NEXT_PUBLIC_SHOW_DEMO_CONTENT` | no | `true` only in development to show demo packages. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | no | `true` only on the live production domain. Otherwise search engines are told not to index. |

No service-role key is needed. Never put one in this project.

## 3. Database setup

### 3.1 Supabase project

A Supabase project named **preema-aviation** (region ap-south-1, Mumbai) has already been created and migrated for you. Its URL and publishable key are in `.env.local`. To start from scratch on another project instead, create it and continue with 3.2.

### 3.2 Apply migrations (new projects only)

In the Supabase SQL editor (or with `supabase db push`), run the files in `supabase/migrations/` **in filename order**:

1. `…0001_schema.sql` – tables, enums, triggers
2. `…0002_security.sql` – Row Level Security, inquiry RPCs, storage bucket
3. `…0003_content.sql` – verified business details and starter content (services, destinations, FAQs, draft policies)
4. `…0004_fix_staff_guard.sql` – staff permission guard fix

For a development database you may also run `supabase/seed/demo.sql` and set `NEXT_PUBLIC_SHOW_DEMO_CONTENT=true`.

### 3.3 Register the inquiry secret

Generate a value (`npm run gen:secret`), put it in `INQUIRY_SUBMIT_SECRET`, then run once in the SQL editor:

```sql
select private.set_app_secret('inquiry_submit', '<the same value>');
```

The existing project already has the secret from `.env.local` registered. To rotate it, run the statement with a new value and update the environment variable at the same time.

### 3.4 Supabase Auth settings

In Supabase → Authentication:

- **URL Configuration:** set *Site URL* to your `NEXT_PUBLIC_SITE_URL`, and add `https://YOUR-DOMAIN/admin/auth/callback` and `http://localhost:3000/admin/auth/callback` to *Redirect URLs*.
- **Email:** keep e-mail confirmation on. For reliable delivery, configure custom SMTP (the built-in sender is heavily rate-limited).
- Sign-ups are restricted by the database: only e-mail addresses that an administrator has invited can create an account. Everyone else is rejected.

## 4. Secure administrator setup (first admin)

No default administrator or password exists anywhere in the code.

1. In the Supabase SQL editor, invite the owner:
   ```sql
   insert into public.staff_invitations (email, full_name, role)
   values ('owner@your-domain.com', 'Owner Name', 'admin');
   ```
2. Open `/admin/signup`, register with that e-mail and a strong password (12+ characters), and confirm via the e-mail link.
3. Sign in at `/admin/login`.
4. Invite further staff from **Admin → Staff users**. They register themselves at `/admin/signup`. Roles:
   - **Administrator** – everything, including content, settings and users.
   - **Travel consultant** – dashboard and inquiries (view, assign, status, notes, export). No content, settings or user management.

At least one active administrator is always enforced by the database.

## 5. Run locally

Requires Node.js 20.9+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (needs the env vars above)
npm run typecheck
```

## 6. Deploy to Vercel

A Vercel project named **preema-aviation** already exists in the AsmaTec team.

1. Push this folder to a Git repository (GitHub/GitLab/Bitbucket) and connect it to the Vercel project — or run `npx vercel --prod` from this folder.
2. Add all environment variables from §2 to the project (Production and Preview). Use `NEXT_PUBLIC_ALLOW_INDEXING=true` for Production only.
3. Add your domain in Vercel, then update `NEXT_PUBLIC_SITE_URL` and the Supabase Auth URLs (§3.4).
4. Note: Vercel's deployment protection is on by default for preview URLs — fine for staging.

## 7. How inquiries work

1. A visitor fills in a form. Validation runs in the browser and again on the server (`src/lib/inquiry-schema.ts`).
2. `/api/inquiries` checks a honeypot field, minimum fill time and form age, then calls the database function `submit_inquiry` with the server secret.
3. The database enforces rate limits (per hashed IP, per phone and overall) and idempotency (the same form submission can't create two records). It stores the record with a random, non-sequential reference such as `PA-7K3M-9QX2`.
4. Only after the database confirms the save does the visitor see the reference and the next steps. On any failure the form keeps everything they typed and lets them retry.
5. If notifications are switched on (Admin → Settings), staff are e-mailed. A failed e-mail is recorded on the inquiry and never undoes the save.
6. Staff manage the inquiry in `/admin/inquiries`: assignment, the status workflow (New → Contacted → Options shared → Awaiting customer → Confirmed / Closed, plus Lost/cancelled), internal notes and an automatic activity history. "Confirmed" is an internal workflow status only.

## 8. Security summary

- Public users have **no** direct access to inquiries, notes, history, staff or private settings (Row Level Security plus revoked table privileges). Inserts happen only through `submit_inquiry`, which requires the server secret.
- Public content queries return published records only; drafts are visible to signed-in staff only. Demo rows are also hidden unless `NEXT_PUBLIC_SHOW_DEMO_CONTENT=true`.
- Admin pages verify the session and role on the server (`requireStaff` / `requireAdmin`), and every write is enforced again by database policies.
- Staff can change only workflow fields on an inquiry, never the customer's submission.
- `/admin` responses carry `noindex` and `no-store`; robots.txt disallows `/admin` and `/api`.

See `docs/` for the content-management guide, the verification record and the list of outstanding business details.
