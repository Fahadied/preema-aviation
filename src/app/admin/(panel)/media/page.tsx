/* eslint-disable @next/next/no-img-element */
import { deleteRecord, uploadMedia } from "@/app/admin/actions";
import { AdminTitle, EmptyState, Field, Flash, Section } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Images" };

interface Media { id: string; url: string; alt: string; credit: string | null; license: string | null; source_url: string | null; created_at: string }

export default async function MediaAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
  const items = (data ?? []) as Media[];
  return (
    <>
      <AdminTitle title="Images" intro="Upload only photos you own or are licensed to use. Record the credit and licence so attribution stays accurate." />
      <Flash saved={sp.saved} error={sp.error} />
      <form action={uploadMedia} className="mb-8">
        <Section title="Upload an image">
          <div>
            <label htmlFor="file" className="field-label">Image file (JPEG, PNG, WebP or AVIF, max 5 MB)</label>
            <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="field" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Alt text (describe the image)" name="alt" required />
            <Field label="Credit" name="credit" placeholder="Photographer / owner" />
            <Field label="Licence" name="license" placeholder="Owned by Preema Aviation, CC BY 4.0…" />
            <Field label="Source page URL" name="source_url" />
          </div>
          <button type="submit" className="btn-primary">Upload</button>
        </Section>
      </form>
      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.id} className="card overflow-hidden">
              <img src={m.url} alt={m.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-2 p-4 text-sm">
                <p className="font-medium">{m.alt}</p>
                {m.credit || m.license ? <p className="text-xs text-muted">{[m.credit, m.license].filter(Boolean).join(" · ")}</p> : null}
                <label className="block text-xs text-muted" htmlFor={`u-${m.id}`}>URL (copy into content)</label>
                <input id={`u-${m.id}`} readOnly value={m.url} className="field text-xs" />
                <form action={deleteRecord}>
                  <input type="hidden" name="table" value="media" />
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="return" value="/admin/media" />
                  <button type="submit" className="text-xs text-danger underline">Delete image</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No uploaded images yet">The starter destination photos are licensed from Wikimedia Commons and listed on the public Image credits page.</EmptyState>
      )}
    </>
  );
}
