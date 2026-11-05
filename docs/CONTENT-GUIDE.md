# Managing content and inquiries — staff guide

Sign in at **/admin/login**. What you see depends on your role.

## Daily inquiry work (all staff)

1. **Dashboard** shows new, open and unassigned inquiries. Every figure is counted from stored records.
2. **Inquiries** – search by reference, name, phone, e-mail or organisation. Filter by status, type, assignee and date.
3. Open an inquiry to:
   - **Call** the customer, or **Open WhatsApp chat** (this only opens WhatsApp; nothing is sent until you press Send there).
   - **Assign** it to yourself or a colleague.
   - Move it through the statuses: *New → Contacted → Options shared → Awaiting customer → Confirmed / Closed*, or *Lost / cancelled*. "Confirmed" is an internal status only — it doesn't issue tickets or confirm payment.
   - Add **internal notes** (call outcomes, quotes sent, follow-up dates). The customer never sees these.
   - Review the **activity history**, which records every status, assignment and note change automatically.
4. **Export CSV** downloads the inquiries that match your current filters (opens in Excel; Bangla characters are preserved).

Tip: record the agreed quotation amount, its validity and the follow-up date in a note. That gives you the lead-tracking data the business plan calls for.

## Website content (administrators)

All text fields support simple formatting:

- a blank line between paragraphs
- `## Heading` and `### Smaller heading`
- `- ` at the start of a line for bullet points
- `**bold**` and `[link text](https://example.com)`

### Packages
- Packages stay **Draft** (private) until you choose **Published**.
- **Price:** choose *Price on request* unless a confirmed price exists. *Starting from* requires the conditions (dates, sharing basis, minimum travellers). The "last updated" date is shown publicly.
- **Gallery:** one image per line as `URL | alt text | credit`. Upload under **Images** first, then paste the URL.
- **Itinerary:** one day per line as `Title | Description`. Days are numbered automatically.
- **Demo content** – tick only for test packages. They never appear on the production site.
- Every "Inquire" action on a package carries the package name into the inquiry automatically.

### Destinations
- These are inspiration pages, separate from purchasable packages. Published packages linked to a destination appear on its page.
- **Visa information:** leave it empty to show a general "we'll confirm current requirements" notice. If you add requirements, you must give the **date last reviewed** and preferably the **official source URL**. Never present unverified rules as current.

### Services, FAQs, policies
- **Services** – the eight service pages. "Inquiry button opens" picks which form the page's button opens.
- **FAQs** – tick *Show on homepage* for the most important ones.
- **Policies & pages** – the privacy policy and terms are **drafts awaiting owner review**. Replace every `[Owner to confirm …]` placeholder, then tick *Reviewed and approved by the owner*. The dashboard reminds you until you do.

### Images
- Upload only photos you own or are licensed to use, and record the credit and licence. Write alt text that describes the image.
- The starter photos come from Wikimedia Commons under Creative Commons licences. Their credits are listed on the public **Image credits** page and must stay visible while you use them.

### Settings & SEO
- **Contact channels:** add phone numbers, e-mail, office hours and the WhatsApp number. WhatsApp buttons appear only after you tick **WhatsApp number verified**. Empty channels are hidden on the site.
- **Establishment year:** stored as 1994, but hidden until you tick **Publish establishment year**, after the owner confirms it.
- **Social links:** Facebook, Instagram and others (`Label | URL`).
- **Staff e-mail notifications:** switch on and list the recipients. This needs `RESEND_API_KEY` and `NOTIFY_FROM_EMAIL` on the server.

### Staff users
- Invite by e-mail and choose a role. The person then registers at `/admin/signup` with that address and sets their own password.
- Untick **Active** to remove someone's access immediately. The system always keeps at least one active administrator.

## Do not publish

- Testimonials, customer counts, awards, accreditations or airline partnerships — unless genuine and documented.
- Internal plans, financial targets, funding or operational information.
- Guaranteed visa outcomes, guaranteed fares or artificial urgency.
