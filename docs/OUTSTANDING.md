# Business details and integrations still required

## Business details (owner to supply or confirm)

| Item | Where to enter | Status |
|---|---|---|
| Office phone number(s) | Admin → Settings | Missing — hidden on the site |
| Public e-mail address | Admin → Settings | Missing — hidden |
| WhatsApp number (verified) | Admin → Settings | Missing — WhatsApp buttons hidden |
| Office hours | Admin → Settings | Missing — hidden |
| Facebook and Instagram page URLs | Admin → Settings | Missing — hidden (channels exist, URLs not supplied) |
| Establishment year (1994) for publication | Admin → Settings → "Publish establishment year" | Stored, **hidden** until confirmed |
| Exact registered business name, travel agency registration details | Content / footer, if desired | Not published — verify first |
| Privacy policy: data retention period | Admin → Policies → Privacy | Placeholder in draft |
| Terms: payment methods and service-fee policy | Admin → Policies → Terms | Placeholder in draft |
| Owner (and ideally legal) review of both policies | Admin → Policies | Flagged "Needs owner review" |
| Real tour packages with confirmed inclusions, validity and prices | Admin → Packages | None published (the site shows a helpful empty state) |
| Destination visa information with official sources and review dates | Admin → Destinations | Intentionally left empty; generic notice shown |
| Own photography (office, team, trips) | Admin → Images | Using licensed Wikimedia Commons images for now |
| Genuine testimonials / trust badges (with permission) | — | Hidden by design; add only when genuine material exists |
| Final domain name | Vercel + `NEXT_PUBLIC_SITE_URL` | Not set |

## Integrations

| Integration | Needed for | What's required |
|---|---|---|
| Transactional e-mail (Resend) | Staff notifications for new inquiries | Resend account, verified sending domain, `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` |
| Custom SMTP in Supabase Auth | Reliable staff sign-up / password-reset e-mails | SMTP credentials (can be the same Resend domain) |
| Domain and DNS | Production launch | Domain added in Vercel; Supabase Auth URLs updated |
| Spam/CAPTCHA (optional, e.g. Cloudflare Turnstile) | Extra protection if spam appears | Site/secret keys; not built yet — honeypot, timing checks and rate limits are active now |
| Analytics (optional) | Measuring channels | e.g. Vercel Analytics or GA4 with a consent decision |
| Bangla version | Future | UI strings are centralised in `src/lib/i18n/en.ts`; content tables carry a `locale` column. Add `bn` content and a locale route. |
| Live fares, ticketing, hotel inventory, online payments | Future phases | Separate supplier/GDS and payment-gateway agreements. Not simulated anywhere on the site. |
