import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { getDestinations, getPackages } from "@/lib/data";
import { SITE_IMAGES } from "@/lib/images";

export const revalidate = 300;
export const metadata: Metadata = { title: "Image credits", alternates: { canonical: "/image-credits" } };

export default async function CreditsPage() {
  const [destinations, packages] = await Promise.all([getDestinations(), getPackages()]);
  const rows = [
    ...Object.values(SITE_IMAGES).map((i) => ({ what: i.alt, credit: i.credit, source: i.source })),
    ...destinations.filter((d) => d.image_credit).map((d) => ({ what: d.hero_image_alt ?? d.name, credit: d.image_credit!, source: d.image_source_url })),
    ...packages.flatMap((p) => p.gallery.filter((g) => g.credit).map((g) => ({ what: g.alt || p.title, credit: g.credit!, source: null as string | null }))),
  ];
  const unique = Array.from(new Map(rows.map((r) => [r.what + r.credit, r])).values());
  return (
    <>
      <PageHeader eyebrow="Credits" title="Image credits" intro="Photographs used on this website and their licences." />
      <div className="container-page max-w-4xl py-14">
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
          {unique.map((r) => (
            <li key={r.what + r.credit} className="p-4 text-sm">
              <p className="font-medium text-navy-900">{r.what}</p>
              <p className="text-muted">
                {r.credit}
                {r.source ? <> — <a className="text-teal-700 underline" href={r.source} target="_blank" rel="noopener noreferrer">source</a></> : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
