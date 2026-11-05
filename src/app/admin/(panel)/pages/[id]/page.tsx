import Link from "next/link";
import { notFound } from "next/navigation";
import { savePage } from "@/app/admin/actions";
import { AdminTitle, Field, Flash, Section, Select, Toggle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Page } from "@/lib/types";

export const metadata = { title: "Edit page" };

export default async function PageEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Page;
  return (
    <>
      <nav className="mb-4 text-sm"><Link className="text-teal-700 underline" href="/admin/pages">← Policies & pages</Link></nav>
      <AdminTitle title={p.title} actions={<Link href={`/${p.slug}`} target="_blank" className="btn-secondary">View on site ↗</Link>} />
      <Flash saved={sp.saved} error={sp.error} />
      <form action={savePage} className="space-y-6">
        <input type="hidden" name="id" value={p.id} />
        <Section title="Content">
          <Field label="Title" name="title" defaultValue={p.title} required />
          <Field label="Body" name="body" defaultValue={p.body} rows={24} hint="Blank line between paragraphs. “## ” for headings, “- ” for bullet points. Replace every [Owner to confirm …] placeholder." />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Status" name="status" defaultValue={p.status} options={[{ value: "draft", label: "Draft (private)" }, { value: "published", label: "Published" }]} />
            <Field label="SEO title" name="seo_title" defaultValue={p.seo_title} />
            <Field label="SEO description" name="seo_description" defaultValue={p.seo_description} />
          </div>
          <Toggle label="Reviewed and approved by the owner" name="owner_reviewed" defaultChecked={!p.needs_owner_review} hint="Tick only after the owner has read and approved this text." />
        </Section>
        <div className="flex justify-end"><button type="submit" className="btn-primary">Save page</button></div>
      </form>
    </>
  );
}
