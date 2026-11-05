import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRecord, savePackage } from "@/app/admin/actions";
import { AdminTitle, Field, Flash, Section, Select, Toggle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { CURRENCIES } from "@/lib/format";
import type { Destination, TravelPackage } from "@/lib/types";

export const metadata = { title: "Edit package" };

export default async function PackageEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let p: Partial<TravelPackage> = { status: "draft", price_mode: "on_request", price_currency: "BDT", audiences: [], gallery: [], itinerary: [] };
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const { data } = await supabase.from("packages").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    p = data as TravelPackage;
  }
  const { data: dests } = await supabase.from("destinations").select("id, name").order("name");
  const gallery = (p.gallery ?? []).map((g) => [g.url, g.alt, g.credit].filter((x) => x !== undefined).join(" | ")).join("\n");
  const itinerary = (p.itinerary ?? []).map((d) => `${d.title} | ${d.description}`).join("\n");

  return (
    <>
      <nav className="mb-4 text-sm"><Link className="text-teal-700 underline" href="/admin/packages">← Packages</Link></nav>
      <AdminTitle
        title={isNew ? "New package" : p.title ?? "Package"}
        actions={!isNew && p.status === "published" ? <Link href={`/packages/${p.slug}`} target="_blank" className="btn-secondary">View on site ↗</Link> : undefined}
      />
      <Flash saved={sp.saved} error={sp.error} />
      <form action={savePackage} className="space-y-6">
        {!isNew ? <input type="hidden" name="id" value={p.id} /> : null}
        <Section title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" name="title" defaultValue={p.title} required />
            <Field label="URL slug" name="slug" defaultValue={p.slug} hint="Leave empty to generate from the title." />
            <Select
              label="Destination"
              name="destination_id"
              defaultValue={p.destination_id ?? ""}
              options={[{ value: "", label: "— None —" }, ...((dests ?? []) as Pick<Destination, "id" | "name">[]).map((d) => ({ value: d.id, label: d.name }))]}
            />
            <Select label="Status" name="status" defaultValue={p.status} options={[{ value: "draft", label: "Draft (private)" }, { value: "published", label: "Published" }]} />
            <Field label="Duration (days)" name="duration_days" type="number" defaultValue={p.duration_days} />
            <Field label="Duration (nights)" name="duration_nights" type="number" defaultValue={p.duration_nights} />
          </div>
          <Field label="Summary (shown on cards)" name="summary" defaultValue={p.summary} rows={2} />
          <Field label="Overview" name="overview" defaultValue={p.overview} rows={5} hint="Paragraphs separated by a blank line. Use “## ” for headings and “- ” for bullet points." />
          <div className="flex flex-wrap gap-6">
            <Toggle label="Featured" name="featured" defaultChecked={p.featured} />
            <Toggle label="Demo content" name="is_demo" defaultChecked={p.is_demo} hint="Demo packages never show on the production website." />
          </div>
          <Field label="Sort order" name="sort_order" type="number" defaultValue={p.sort_order ?? 0} className="max-w-40" />
        </Section>

        <Section title="Filters">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Travel styles (one per line)" name="travel_styles" defaultValue={(p.travel_styles ?? []).join("\n")} rows={4} hint="e.g. Beach, Heritage, Adventure" />
            <fieldset>
              <legend className="field-label">Suitable for</legend>
              {["family", "couple", "group", "corporate"].map((a) => (
                <label key={a} className="flex items-center gap-2 py-1 text-sm capitalize">
                  <input type="checkbox" name="audiences" value={a} defaultChecked={p.audiences?.includes(a)} className="size-4 accent-teal-600" /> {a}
                </label>
              ))}
            </fieldset>
          </div>
        </Section>

        <Section title="Images">
          <Field
            label="Gallery (one image per line: URL | alt text | credit)"
            name="gallery"
            defaultValue={gallery}
            rows={4}
            hint="Upload images under Images, then paste the URL here. The first image is used on cards. Alt text describes the image for screen readers."
          />
        </Section>

        <Section title="Itinerary">
          <Field label="Day-by-day (one day per line: Title | Description)" name="itinerary" defaultValue={itinerary} rows={6} />
        </Section>

        <Section title="Inclusions & arrangements">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inclusions (one per line)" name="inclusions" defaultValue={(p.inclusions ?? []).join("\n")} rows={5} />
            <Field label="Exclusions (one per line)" name="exclusions" defaultValue={(p.exclusions ?? []).join("\n")} rows={5} />
            <Field label="Hotel category" name="hotel_category" defaultValue={p.hotel_category} />
            <Field label="Transport" name="transport" defaultValue={p.transport} />
            <Field label="Meals" name="meals" defaultValue={p.meals} />
            <Field label="Minimum travellers" name="min_travellers" type="number" defaultValue={p.min_travellers} />
            <Field label="Valid from" name="valid_from" type="date" defaultValue={p.valid_from} />
            <Field label="Valid until" name="valid_until" type="date" defaultValue={p.valid_until} />
          </div>
          <Field label="Visa notes" name="visa_notes" defaultValue={p.visa_notes} rows={2} hint="Only include requirements you have verified from official sources." />
          <Field label="Cancellation conditions" name="cancellation_conditions" defaultValue={p.cancellation_conditions} rows={3} />
        </Section>

        <Section title="Price">
          <p className="text-sm text-muted">Only enter an amount you have confirmed. Otherwise keep “Price on request”.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Price display"
              name="price_mode"
              defaultValue={p.price_mode}
              options={[
                { value: "on_request", label: "Price on request" },
                { value: "starting_from", label: "Starting from" },
                { value: "fixed", label: "Fixed price" },
              ]}
            />
            <Field label="Amount" name="price_amount" type="number" defaultValue={p.price_amount} />
            <Select label="Currency" name="price_currency" defaultValue={p.price_currency} options={CURRENCIES.map((c) => ({ value: c, label: c === "BDT" ? "BDT (৳)" : c }))} />
            <Field label="Price basis" name="price_basis" defaultValue={p.price_basis} placeholder="per person, twin sharing" />
            <Field label="Price last updated" name="price_updated_at" type="date" defaultValue={p.price_updated_at} hint="Defaults to today when saving a price." />
          </div>
          <Field label="Price conditions (required for “Starting from”)" name="price_conditions" defaultValue={p.price_conditions} rows={2} />
        </Section>

        <Section title="Search engines">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SEO title" name="seo_title" defaultValue={p.seo_title} />
            <Field label="SEO description" name="seo_description" defaultValue={p.seo_description} />
          </div>
        </Section>

        <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-line bg-ivory-100/95 px-4 py-3 backdrop-blur">
          <button type="submit" className="btn-primary">Save package</button>
        </div>
      </form>
      {!isNew ? (
        <form action={deleteRecord} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="table" value="packages" />
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="return" value="/admin/packages" />
          <button type="submit" className="text-sm font-semibold text-danger underline">Delete this package permanently</button>
          <p className="mt-1 text-xs text-muted">Existing inquiries keep their reference to the package name.</p>
        </form>
      ) : null}
    </>
  );
}
