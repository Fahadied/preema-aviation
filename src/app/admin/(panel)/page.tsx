import Link from "next/link";
import { AdminTitle, EmptyState, Flash, StatusBadge } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { typeLabel } from "@/lib/inquiry-summary";
import { t } from "@/lib/i18n/en";
import type { Inquiry, InquiryStatus } from "@/lib/types";

export const metadata = { title: "Dashboard" };

type Stats = {
  total: number;
  new: number;
  open: number;
  last_7_days: number;
  unassigned_open: number;
  notification_failed: number;
  by_status: Partial<Record<InquiryStatus, number>>;
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase, profile } = await requireStaff();
  const sp = await searchParams;
  const [{ data: stats }, { data: recent }, mineRes, settingsRes, pagesRes] = await Promise.all([
    supabase.rpc("inquiry_stats"),
    supabase.from("inquiries").select("id, reference, type, status, customer_name, context_label, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("assigned_to", profile.id).not("status", "in", "(confirmed,closed,lost)"),
    profile.role === "admin" ? supabase.from("site_settings").select("phones, email, whatsapp, whatsapp_verified").eq("id", 1).maybeSingle() : Promise.resolve({ data: null }),
    profile.role === "admin" ? supabase.from("pages").select("id, title").eq("needs_owner_review", true) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);
  const s = (stats ?? { total: 0, new: 0, open: 0, last_7_days: 0, unassigned_open: 0, notification_failed: 0, by_status: {} }) as Stats;
  const myOpen = mineRes.count ?? 0;
  const settings = settingsRes.data as { phones: string[]; email: string | null; whatsapp: string | null; whatsapp_verified: boolean } | null;
  const reviewPages = (pagesRes.data ?? []) as { id: string; title: string }[];

  const tiles = [
    { label: "New inquiries", value: s.new, href: "/admin/inquiries?status=new" },
    { label: "Open inquiries", value: s.open, href: "/admin/inquiries?status=open" },
    { label: "Unassigned & open", value: s.unassigned_open, href: "/admin/inquiries?assigned=none&status=open" },
    { label: "Received in last 7 days", value: s.last_7_days, href: "/admin/inquiries" },
  ];

  const setup: { text: string; href: string }[] = [];
  if (settings) {
    if (!settings.phones?.length) setup.push({ text: "Add the office phone number(s)", href: "/admin/settings" });
    if (!settings.email) setup.push({ text: "Add the public e-mail address", href: "/admin/settings" });
    if (!settings.whatsapp || !settings.whatsapp_verified) setup.push({ text: "Add and verify the WhatsApp number", href: "/admin/settings" });
  }
  reviewPages.forEach((p) => setup.push({ text: `Owner review needed: ${p.title}`, href: `/admin/pages/${p.id}` }));

  return (
    <>
      <AdminTitle title={`Hello${profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`} intro="Figures below are calculated from the inquiries stored in the database." />
      <Flash error={sp.error === "admin-only" ? "That area is available to administrators only." : undefined} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} className="card p-5 hover:border-teal-600">
            <p className="text-sm text-muted">{tile.label}</p>
            <p className="mt-2 font-serif text-4xl text-navy-900">{tile.value}</p>
          </Link>
        ))}
      </div>
      {typeof myOpen === "number" ? (
        <p className="mt-4 text-sm text-muted">
          You have <Link className="font-semibold text-teal-700 underline" href="/admin/inquiries?assigned=me&status=open">{myOpen} open inquir{myOpen === 1 ? "y" : "ies"}</Link> assigned to you.
          {s.notification_failed ? <> · <span className="text-danger">{s.notification_failed} staff e-mail notification(s) failed</span></> : null}
        </p>
      ) : null}

      {setup.length ? (
        <section className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="text-lg">Before public launch</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {setup.map((x) => <li key={x.text}><Link className="text-amber-950 underline" href={x.href}>{x.text}</Link></li>)}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Latest inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm font-semibold text-teal-700 underline">View all</Link>
        </div>
        {recent && recent.length ? (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
                <tr><th className="p-3">Reference</th><th className="p-3">Customer</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Received</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(recent as Inquiry[]).map((i) => (
                  <tr key={i.id} className="hover:bg-ivory-50">
                    <td className="p-3 font-mono"><Link className="text-teal-700 underline" href={`/admin/inquiries/${i.id}`}>{i.reference}</Link></td>
                    <td className="p-3">{i.customer_name}</td>
                    <td className="p-3">{typeLabel(i.type)}{i.context_label ? <span className="block text-xs text-muted">{i.context_label}</span> : null}</td>
                    <td className="p-3"><StatusBadge status={i.status} /></td>
                    <td className="p-3 text-muted">{formatDateTime(i.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No inquiries yet">New website inquiries will appear here as soon as visitors submit them.</EmptyState>
        )}
      </section>

      {s.total ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl">By status</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(t.statuses) as InquiryStatus[]).map((st) => (
              <Link key={st} href={`/admin/inquiries?status=${st}`} className="chip gap-2">
                {t.statuses[st]} <strong>{s.by_status?.[st] ?? 0}</strong>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
