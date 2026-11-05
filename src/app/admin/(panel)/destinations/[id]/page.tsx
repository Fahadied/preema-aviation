import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRecord, saveDestination } from "@/app/admin/actions";
import { AdminTitle, Field, Flash, Section, Select, Toggle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Destination } from "@/lib/types";

export const metadata = { title: "Edit destination" };

export default async function DestinationEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let d: Partial<Destination> = { status: "draft" };
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const { data } = await supabase.from("destinations").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    d = data as Destination;
  }
  return (
    <>
      <nav className="mb-4 text-sm"><Link className="text-teal-700 underline" href="/admin/destinations">← Destinations</Link></nav>
      <AdminTitle title={isNew ? "New destination" : d.name ?? "Destination"} actions={!isNew && d.status === "published" ? <Link href={`/destinations/${d.slug}`} target="_blank" className="btn-secondary">View on site ↗</Link> : undefined} />
      <Flash saved={sp.saved} error={sp.error} />
      <form action={saveDestination} className="space-y-6">
        {!isNew ? <input type="hidden" name="id" value={d.id} /> : null}
        <Section title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" defaultValue={d.name} required />
            <Field label="URL slug" name="slug" defaultValue={d.slug} hint="Leave empty to generate from the name." />
            <Field label="Country" name="country" defaultValue={d.country} />
            <Field label="Region" name="region" defaultValue={d.region} />
            <Select label="Status" name="status" defaultValue={d.status} options={[{ value: "draft", label: "Draft (private)" }, { value: "published", label: "Published" }]} />
            <Field label="Sort order" name="sort_order" type="number" defaultValue={d.sort_order ?? 0} />
          </div>
          <div className="flex flex-wrap gap-6">
            <Toggle label="Within Bangladesh" name="is_domestic" defaultChecked={d.is_domestic} />
            <Toggle label="Featured on homepage" name="featured" defaultChecked={d.featured} />
            <Toggle label="Demo content" name="is_demo" defaultChecked={d.is_demo} />
          </div>
          <Field label="Summary" name="summary" defaultValue={d.summary} rows={2} />
          <Field label="Overview" name="overview" defaultValue={d.overview} rows={5} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Travel styles (one per line)" name="travel_styles" defaultValue={(d.travel_styles ?? []).join("\n")} rows={4} />
            <Field label="Example experiences (one per line)" name="experiences" defaultValue={(d.experiences ?? []).join("\n")} rows={4} />
          </div>
          <Field label="General planning considerations" name="planning_notes" defaultValue={d.planning_notes} rows={4} />
        </Section>
        <Section title="Visa information (optional)">
          <p className="text-sm text-muted">Leave empty to show a general “ask us to confirm current requirements” notice. If you add requirements, include the official source and the date you checked them.</p>
          <Field label="Visa notes" name="visa_notes" defaultValue={d.visa_notes} rows={4} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Official source URL" name="visa_source" defaultValue={d.visa_source} />
            <Field label="Last reviewed" name="visa_reviewed_at" type="date" defaultValue={d.visa_reviewed_at} />
          </div>
        </Section>
        <Section title="Image">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero image URL" name="hero_image_url" defaultValue={d.hero_image_url} className="sm:col-span-2" />
            <Field label="Alt text" name="hero_image_alt" defaultValue={d.hero_image_alt} />
            <Field label="Credit / licence" name="image_credit" defaultValue={d.image_credit} />
            <Field label="Image source page" name="image_source_url" defaultValue={d.image_source_url} />
          </div>
        </Section>
        <Section title="Search engines">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SEO title" name="seo_title" defaultValue={d.seo_title} />
            <Field label="SEO description" name="seo_description" defaultValue={d.seo_description} />
          </div>
        </Section>
        <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-line bg-ivory-100/95 px-4 py-3 backdrop-blur">
          <button type="submit" className="btn-primary">Save destination</button>
        </div>
      </form>
      {!isNew ? (
        <form action={deleteRecord} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="table" value="destinations" />
          <input type="hidden" name="id" value={d.id} />
          <input type="hidden" name="return" value="/admin/destinations" />
          <button type="submit" className="text-sm font-semibold text-danger underline">Delete this destination permanently</button>
        </form>
      ) : null}
    </>
  );
}
