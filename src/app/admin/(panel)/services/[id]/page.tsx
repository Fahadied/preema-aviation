import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRecord, saveService } from "@/app/admin/actions";
import { AdminTitle, Field, Flash, Section, Select } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Service } from "@/lib/types";

export const metadata = { title: "Edit service" };

export default async function ServiceEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let s: Partial<Service> = { status: "draft", inquiry_type: "contact" };
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    s = data as Service;
  }
  return (
    <>
      <nav className="mb-4 text-sm"><Link className="text-teal-700 underline" href="/admin/services">← Services</Link></nav>
      <AdminTitle title={isNew ? "New service" : s.title ?? "Service"} />
      <Flash saved={sp.saved} error={sp.error} />
      <form action={saveService} className="space-y-6">
        {!isNew ? <input type="hidden" name="id" value={s.id} /> : null}
        <Section title="Content">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" name="title" defaultValue={s.title} required />
            <Field label="URL slug" name="slug" defaultValue={s.slug} />
            <Select label="Status" name="status" defaultValue={s.status} options={[{ value: "draft", label: "Draft (private)" }, { value: "published", label: "Published" }]} />
            <Select
              label="Inquiry button opens"
              name="inquiry_type"
              defaultValue={s.inquiry_type}
              options={[
                { value: "flight", label: "Flight inquiry" },
                { value: "holiday", label: "Holiday inquiry" },
                { value: "visa", label: "Visa inquiry" },
                { value: "hotel", label: "Hotel inquiry" },
                { value: "corporate", label: "Corporate inquiry" },
                { value: "contact", label: "Contact form" },
              ]}
            />
            <Field label="Sort order" name="sort_order" type="number" defaultValue={s.sort_order ?? 0} />
          </div>
          <Field label="Summary" name="summary" defaultValue={s.summary} rows={2} />
          <Field label="Page content" name="body" defaultValue={s.body} rows={12} hint="Blank line between paragraphs. “## ” for headings, “- ” for bullet points, **bold**, [link text](https://…)." />
          <Field label="Highlights (one per line)" name="highlights" defaultValue={(s.highlights ?? []).join("\n")} rows={3} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Image URL (optional)" name="image_url" defaultValue={s.image_url} />
            <Field label="Image alt text" name="image_alt" defaultValue={s.image_alt} />
            <Field label="SEO title" name="seo_title" defaultValue={s.seo_title} />
            <Field label="SEO description" name="seo_description" defaultValue={s.seo_description} />
          </div>
        </Section>
        <div className="flex justify-end"><button type="submit" className="btn-primary">Save service</button></div>
      </form>
      {!isNew ? (
        <form action={deleteRecord} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="table" value="services" />
          <input type="hidden" name="id" value={s.id} />
          <input type="hidden" name="return" value="/admin/services" />
          <button type="submit" className="text-sm font-semibold text-danger underline">Delete this service permanently</button>
        </form>
      ) : null}
    </>
  );
}
