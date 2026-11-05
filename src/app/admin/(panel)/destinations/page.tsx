import Link from "next/link";
import { AdminTitle, EmptyState, Flash, PublishBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Destination } from "@/lib/types";

export const metadata = { title: "Destinations" };

export default async function DestinationsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data } = await supabase.from("destinations").select("*").order("sort_order");
  const rows = (data ?? []) as Destination[];
  return (
    <>
      <AdminTitle title="Destinations" intro="Inspiration pages. Keep visa information factual, sourced and dated." actions={<Link href="/admin/destinations/new" className="btn-primary">New destination</Link>} />
      <Flash saved={sp.saved} error={sp.error} />
      {rows.length ? (
        <div className="card divide-y divide-line">
          {rows.map((d) => (
            <Link key={d.id} href={`/admin/destinations/${d.id}`} className="flex flex-col gap-2 p-4 hover:bg-ivory-50 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-navy-900">{d.name}</p>
                <p className="text-xs text-muted">{d.country}{d.featured ? " · Featured" : ""}{d.visa_reviewed_at ? ` · Visa info reviewed ${d.visa_reviewed_at}` : ""}</p>
              </div>
              <PublishBadge status={d.status} demo={d.is_demo} />
            </Link>
          ))}
        </div>
      ) : <EmptyState title="No destinations yet" />}
    </>
  );
}
