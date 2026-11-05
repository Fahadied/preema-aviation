import Link from "next/link";
import { AdminTitle, EmptyState, StatusBadge } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n/en";
import { inquiryQuery, readFilters } from "@/lib/inquiry-query";
import { typeLabel } from "@/lib/inquiry-summary";
import type { Inquiry, StaffProfile } from "@/lib/types";

export const metadata = { title: "Inquiries" };
const PAGE_SIZE = 25;

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, profile } = await requireStaff();
  const sp = await searchParams;
  const f = readFilters(sp);
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const [{ data, count, error }, { data: staff }] = await Promise.all([
    inquiryQuery(supabase, f, profile.id, "id, reference, type, status, customer_name, customer_phone, context_label, assigned_to, created_at, notification_status", true).range(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE - 1,
    ),
    supabase.from("staff_profiles").select("id, full_name, email, active").order("full_name"),
  ]);
  const rows = (data ?? []) as unknown as Inquiry[];
  const staffById = new Map(((staff ?? []) as StaffProfile[]).map((s) => [s.id, s.full_name || s.email]));
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]);
  const pageHref = (p: number) => {
    const x = new URLSearchParams(qs);
    x.set("page", String(p));
    return `/admin/inquiries?${x}`;
  };

  return (
    <>
      <AdminTitle
        title="Inquiries"
        intro="Search, filter and open inquiries. Only signed-in staff can see this information."
        actions={<a href={`/admin/inquiries/export?${qs}`} className="btn-secondary">Export CSV</a>}
      />
      <form method="get" className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end" role="search">
        <div className="lg:col-span-2">
          <label className="field-label" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={f.q} placeholder="Reference, name, phone, e-mail…" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={f.status} className="field">
            <option value="">All</option>
            <option value="open">Open (not finished)</option>
            {Object.entries(t.statuses).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={f.type} className="field">
            <option value="">All</option>
            {Object.entries(t.inquiryTypes).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="assigned">Assigned to</label>
          <select id="assigned" name="assigned" defaultValue={f.assigned} className="field">
            <option value="">Anyone</option>
            <option value="me">Me</option>
            <option value="none">Unassigned</option>
            {((staff ?? []) as StaffProfile[]).filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.full_name || s.email}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">Filter</button>
          <Link href="/admin/inquiries" className="btn-secondary">Reset</Link>
        </div>
        <div>
          <label className="field-label" htmlFor="from">Received from</label>
          <input id="from" name="from" type="date" defaultValue={f.from} className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="to">Received until</label>
          <input id="to" name="to" type="date" defaultValue={f.to} className="field" />
        </div>
      </form>

      {error ? <p role="alert" className="mb-4 text-sm text-danger">Could not load inquiries: {error.message}</p> : null}
      <p className="mb-3 text-sm text-muted" role="status">{total} inquir{total === 1 ? "y" : "ies"}</p>

      {rows.length ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3">Reference</th><th className="p-3">Customer</th><th className="p-3">Type</th>
                <th className="p-3">Status</th><th className="p-3">Assigned</th><th className="p-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((i) => (
                <tr key={i.id} className="hover:bg-ivory-50">
                  <td className="p-3 font-mono"><Link className="text-teal-700 underline" href={`/admin/inquiries/${i.id}`}>{i.reference}</Link></td>
                  <td className="p-3">{i.customer_name}<span className="block text-xs text-muted">{i.customer_phone}</span></td>
                  <td className="p-3">{typeLabel(i.type)}{i.context_label ? <span className="block text-xs text-muted">{i.context_label}</span> : null}</td>
                  <td className="p-3"><StatusBadge status={i.status} /></td>
                  <td className="p-3">{i.assigned_to ? staffById.get(i.assigned_to) ?? "—" : <span className="text-muted">Unassigned</span>}</td>
                  <td className="p-3 text-muted">{formatDateTime(i.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title={qs.toString() ? "No inquiries match these filters" : "No inquiries yet"}>
          {qs.toString() ? "Try clearing a filter." : "Inquiries submitted on the website will appear here."}
        </EmptyState>
      )}

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? <Link className="btn-secondary" href={pageHref(page - 1)}>Previous</Link> : <span />}
          <span className="text-muted">Page {page} of {pages}</span>
          {page < pages ? <Link className="btn-secondary" href={pageHref(page + 1)}>Next</Link> : <span />}
        </nav>
      ) : null}
    </>
  );
}
