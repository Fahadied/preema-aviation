import Link from "next/link";
import { AdminTitle, EmptyState, Flash, PublishBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { priceLabel } from "@/lib/format";
import type { TravelPackage } from "@/lib/types";

export const metadata = { title: "Packages" };

export default async function PackagesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data } = await supabase.from("packages").select("*, destination:destinations(name)").order("sort_order").order("created_at");
  const rows = (data ?? []) as (TravelPackage & { destination: { name: string } | null })[];
  return (
    <>
      <AdminTitle
        title="Tour packages"
        intro="Only published, non-demo packages appear on the public website. Leave the price empty and choose “Price on request” unless a confirmed price is available."
        actions={<Link href="/admin/packages/new" className="btn-primary">New package</Link>}
      />
      <Flash saved={sp.saved} error={sp.error} />
      {rows.length ? (
        <div className="card divide-y divide-line">
          {rows.map((p) => (
            <Link key={p.id} href={`/admin/packages/${p.id}`} className="flex flex-col gap-2 p-4 hover:bg-ivory-50 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-navy-900">{p.title}</p>
                <p className="text-xs text-muted">{p.destination?.name ?? "No destination"} · {priceLabel({ ...p, price_amount: p.price_amount == null ? null : Number(p.price_amount) })}</p>
              </div>
              <PublishBadge status={p.status} demo={p.is_demo} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No packages yet">Create your first package. It stays private until you set it to Published.</EmptyState>
      )}
    </>
  );
}
