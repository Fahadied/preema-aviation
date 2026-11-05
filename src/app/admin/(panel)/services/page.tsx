import Link from "next/link";
import { AdminTitle, Flash, PublishBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Service } from "@/lib/types";

export const metadata = { title: "Services" };

export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data } = await supabase.from("services").select("*").order("sort_order");
  return (
    <>
      <AdminTitle title="Services" actions={<Link href="/admin/services/new" className="btn-primary">New service</Link>} />
      <Flash saved={sp.saved} error={sp.error} />
      <div className="card divide-y divide-line">
        {((data ?? []) as Service[]).map((s) => (
          <Link key={s.id} href={`/admin/services/${s.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-ivory-50">
            <span className="font-medium text-navy-900">{s.title}</span>
            <PublishBadge status={s.status} />
          </Link>
        ))}
      </div>
    </>
  );
}
