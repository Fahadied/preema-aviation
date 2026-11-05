import Link from "next/link";
import { notFound } from "next/navigation";
import { addNote, assignToMe, updateInquiry } from "@/app/admin/actions";
import { Flash, StatusBadge } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatDateTime, telLink, whatsappLink } from "@/lib/format";
import { t } from "@/lib/i18n/en";
import { detailRows, typeLabel } from "@/lib/inquiry-summary";
import type { Inquiry, InquiryEvent, InquiryNote, InquiryStatus, StaffProfile } from "@/lib/types";

export const metadata = { title: "Inquiry" };

const EVENT_LABEL: Record<string, string> = {
  created: "Inquiry received",
  status_changed: "Status changed",
  assigned: "Assignment changed",
  note_added: "Note added",
  notification: "Notification",
};

export default async function InquiryDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { supabase, profile } = await requireStaff();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ data: inquiry }, { data: notes }, { data: events }, { data: staff }] = await Promise.all([
    supabase.from("inquiries").select("*").eq("id", id).maybeSingle(),
    supabase.from("inquiry_notes").select("*").eq("inquiry_id", id).order("created_at", { ascending: false }),
    supabase.from("inquiry_events").select("*").eq("inquiry_id", id).order("created_at", { ascending: false }),
    supabase.from("staff_profiles").select("id, full_name, email, role, active").order("full_name"),
  ]);
  if (!inquiry) notFound();
  const i = inquiry as Inquiry;
  const staffList = (staff ?? []) as StaffProfile[];
  const nameOf = (uid: string | null) => (uid ? staffList.find((s) => s.id === uid)?.full_name || staffList.find((s) => s.id === uid)?.email || "Staff" : "System");
  const [pkg, dest] = await Promise.all([
    i.package_id ? supabase.from("packages").select("slug, title").eq("id", i.package_id).maybeSingle() : Promise.resolve({ data: null }),
    i.destination_id ? supabase.from("destinations").select("slug, name").eq("id", i.destination_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const rows = detailRows(i.details);

  return (
    <>
      <nav className="mb-4 text-sm"><Link className="text-teal-700 underline" href="/admin/inquiries">← All inquiries</Link></nav>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-3xl">{i.reference}</h1>
        <StatusBadge status={i.status} />
        <span className="chip">{typeLabel(i.type)}</span>
      </div>
      <Flash saved={sp.saved} error={sp.error} />
      <p className="mb-6 text-sm text-muted">
        Received {formatDateTime(i.created_at)}
        {i.source_path ? <> from <code className="rounded bg-white px-1">{i.source_path}</code></> : null}
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h2 className="text-lg">Customer</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Name</dt><dd className="font-medium">{i.customer_name}</dd></div>
              {i.organization ? <div><dt className="text-muted">Organisation</dt><dd className="font-medium">{i.organization}</dd></div> : null}
              <div><dt className="text-muted">Phone</dt><dd><a className="font-medium text-teal-700 underline" href={telLink(i.customer_phone)}>{i.customer_phone}</a></dd></div>
              {i.customer_email ? <div><dt className="text-muted">E-mail</dt><dd><a className="font-medium text-teal-700 underline" href={`mailto:${i.customer_email}`}>{i.customer_email}</a></dd></div> : null}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="btn-secondary" href={telLink(i.customer_phone)}>Call</a>
              <a className="btn-secondary" href={whatsappLink(i.customer_phone, `Hello ${i.customer_name}, this is Preema Aviation regarding your inquiry ${i.reference}.`)} target="_blank" rel="noopener noreferrer">
                Open WhatsApp chat
              </a>
            </div>
            <p className="mt-2 text-xs text-muted">Opening WhatsApp does not send anything — record the outcome as a note.</p>
          </section>

          <section className="card p-6">
            <h2 className="text-lg">Travel details</h2>
            {pkg.data || dest.data || i.context_label ? (
              <p className="mt-2 text-sm">
                Regarding:{" "}
                {pkg.data ? <Link className="font-medium text-teal-700 underline" href={`/packages/${pkg.data.slug}`} target="_blank">{pkg.data.title}</Link> : null}
                {pkg.data && dest.data ? " · " : null}
                {dest.data ? <Link className="font-medium text-teal-700 underline" href={`/destinations/${dest.data.slug}`} target="_blank">{dest.data.name}</Link> : null}
                {!pkg.data && !dest.data ? i.context_label : null}
              </p>
            ) : null}
            {rows.length ? (
              <dl className="mt-3 divide-y divide-line text-sm">
                {rows.map((r) => (
                  <div key={r.label} className="grid gap-1 py-2 sm:grid-cols-3">
                    <dt className="text-muted">{r.label}</dt>
                    <dd className="whitespace-pre-wrap sm:col-span-2">{r.value}</dd>
                  </div>
                ))}
              </dl>
            ) : <p className="mt-2 text-sm text-muted">No additional details.</p>}
          </section>

          <section className="card p-6">
            <h2 className="text-lg">Internal notes</h2>
            <p className="text-xs text-muted">Visible to staff only.</p>
            <form action={addNote} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={i.id} />
              <label htmlFor="note" className="sr-only">New note</label>
              <textarea id="note" name="body" rows={3} required maxLength={5000} className="field" placeholder="Call outcome, options shared, next follow-up…" />
              <button type="submit" className="btn-primary">Add note</button>
            </form>
            <ul className="mt-5 space-y-3">
              {((notes ?? []) as InquiryNote[]).map((n) => (
                <li key={n.id} className="rounded-xl bg-ivory-50 p-3 text-sm">
                  <p className="whitespace-pre-wrap">{n.body}</p>
                  <p className="mt-1 text-xs text-muted">{nameOf(n.author_id)} · {formatDateTime(n.created_at)}</p>
                </li>
              ))}
              {!notes?.length ? <li className="text-sm text-muted">No notes yet.</li> : null}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg">Workflow</h2>
            <form action={updateInquiry} className="mt-3 space-y-4">
              <input type="hidden" name="id" value={i.id} />
              <div>
                <label htmlFor="status" className="field-label">Status</label>
                <select id="status" name="status" defaultValue={i.status} className="field">
                  {(Object.keys(t.statuses) as InquiryStatus[]).map((s) => <option key={s} value={s}>{t.statuses[s]}</option>)}
                </select>
                <p className="field-hint">“Confirmed” is an internal workflow status. It does not issue tickets or confirm payment.</p>
              </div>
              <div>
                <label htmlFor="assigned_to" className="field-label">Assigned to</label>
                <select id="assigned_to" name="assigned_to" defaultValue={i.assigned_to ?? ""} className="field">
                  <option value="">Unassigned</option>
                  {staffList.filter((s) => s.active || s.id === i.assigned_to).map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name || s.email}{s.role === "admin" ? " (admin)" : ""}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">Save changes</button>
            </form>
            {i.assigned_to !== profile.id ? (
              <form action={assignToMe} className="mt-2">
                <input type="hidden" name="id" value={i.id} />
                <button type="submit" className="btn-secondary w-full">Assign to me</button>
              </form>
            ) : null}
          </section>

          <section className="card p-6 text-sm">
            <h2 className="text-lg">Staff notification</h2>
            <p className="mt-2">
              {i.notification_status === "sent" && "E-mail notification sent."}
              {i.notification_status === "failed" && <span className="text-danger">E-mail notification failed: {i.notification_error}</span>}
              {i.notification_status === "pending" && "E-mail notification pending or interrupted."}
              {i.notification_status === "not_configured" && <span className="text-muted">E-mail notifications were not enabled when this inquiry arrived.</span>}
            </p>
            <p className="mt-1 text-xs text-muted">The inquiry is saved regardless of notification status.</p>
          </section>

          <section className="card p-6">
            <h2 className="text-lg">Activity history</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {((events ?? []) as InquiryEvent[]).map((e) => (
                <li key={e.id} className="border-l-2 border-teal-100 pl-3">
                  <p className="font-medium">{EVENT_LABEL[e.event_type] ?? e.event_type}</p>
                  <p className="text-muted">
                    {e.event_type === "status_changed"
                      ? `${t.statuses[e.from_value as InquiryStatus] ?? e.from_value} → ${t.statuses[e.to_value as InquiryStatus] ?? e.to_value}`
                      : e.event_type === "assigned"
                        ? `${e.from_value ?? "Unassigned"} → ${e.to_value ?? "Unassigned"}`
                        : e.event_type === "created" ? "via website" : e.to_value}
                  </p>
                  <p className="text-xs text-muted">{e.actor_id ? nameOf(e.actor_id) : "System"} · {formatDateTime(e.created_at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
