import Link from "next/link";
import { AdminTitle, Flash, PublishBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Page } from "@/lib/types";

export const metadata = { title: "Policies & pages" };

export default async function PagesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data } = await supabase.from("pages").select("*").order("slug");
  return (
    <>
      <AdminTitle title="Policies & pages" intro="Policy drafts must be reviewed by the owner (and ideally a legal adviser) before public launch." />
      <Flash saved={sp.saved} error={sp.error} />
      <div className="card divide-y divide-line">
        {((data ?? []) as Page[]).map((p) => (
          <Link key={p.id} href={`/admin/pages/${p.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-ivory-50">
            <span>
              <span className="font-medium text-navy-900">{p.title}</span>
              <span className="block text-xs text-muted">/{p.slug}</span>
            </span>
            <span className="flex gap-2">
              {p.needs_owner_review ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Needs owner review</span> : null}
              <PublishBadge status={p.status} />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
