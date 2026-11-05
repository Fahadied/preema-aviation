import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryWidget } from "@/components/forms/InquiryWidget";
import { RichText } from "@/components/RichText";
import { DemoBadge, Notice } from "@/components/ui";
import { getPackage, getSettings } from "@/lib/data";
import { durationLabel, formatDate, priceLabel } from "@/lib/format";
import { t } from "@/lib/i18n/en";
import { optimizable } from "@/lib/images";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPackage(slug);
  if (!p) return { title: "Package not found" };
  return {
    title: p.seo_title || p.title,
    description: p.seo_description || p.summary,
    alternates: { canonical: `/packages/${p.slug}` },
    robots: p.is_demo ? { index: false, follow: false } : undefined,
    openGraph: p.gallery[0] ? { images: [{ url: p.gallery[0].url, alt: p.gallery[0].alt }] } : undefined,
  };
}

function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="border-t border-line py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-[15px] text-navy-900">{value}</dd>
    </div>
  );
}

export default async function PackagePage({ params }: Props) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getPackage(slug), getSettings()]);
  if (!p) notFound();
  const [main, ...rest] = p.gallery;
  const validity =
    p.valid_from || p.valid_until
      ? [p.valid_from && `from ${formatDate(p.valid_from)}`, p.valid_until && `until ${formatDate(p.valid_until)}`].filter(Boolean).join(" ")
      : null;

  return (
    <>
      <section className="border-b border-line bg-ivory-100">
        <div className="container-page py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/packages" className="hover:text-teal-700">Tour packages</Link>
            {p.destination ? <> / <Link href={`/destinations/${p.destination.slug}`} className="hover:text-teal-700">{p.destination.name}</Link></> : null}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {p.is_demo ? <DemoBadge /> : null}
            <p className="eyebrow">{[p.destination?.name, durationLabel(p)].filter(Boolean).join(" · ")}</p>
          </div>
          <h1 className="mt-3 max-w-4xl text-4xl sm:text-5xl">{p.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{p.summary}</p>
        </div>
      </section>

      {main ? (
        <section className="container-page pt-8" aria-label="Image gallery">
          <div className={`grid gap-3 ${rest.length ? "md:grid-cols-3" : ""}`}>
            <figure className={`relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] ${rest.length ? "md:col-span-2 md:row-span-2 md:aspect-auto" : ""}`}>
              <Image src={main.url} unoptimized={!optimizable(main.url)} alt={main.alt || p.title} fill priority sizes="(min-width: 768px) 66vw, 100vw" className="object-cover" />
              {main.credit ? <figcaption className="absolute right-2 bottom-1 text-[10px] text-white/80 drop-shadow">Photo: {main.credit}</figcaption> : null}
            </figure>
            {rest.slice(0, 4).map((g) => (
              <figure key={g.url} className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)]">
                <Image src={g.url} unoptimized={!optimizable(g.url)} alt={g.alt || ""} fill loading="lazy" sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                {g.credit ? <figcaption className="absolute right-2 bottom-1 text-[10px] text-white/80 drop-shadow">Photo: {g.credit}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <div className="container-page grid gap-12 py-12 lg:grid-cols-12 lg:py-16">
        <div className="space-y-12 lg:col-span-7">
          {p.is_demo ? <Notice>This is demonstration content used for testing. It is not a real offer.</Notice> : null}
          {p.overview ? (
            <section aria-labelledby="ov">
              <h2 id="ov" className="text-3xl">Overview</h2>
              <RichText text={p.overview} />
            </section>
          ) : null}

          {p.itinerary.length ? (
            <section aria-labelledby="it">
              <h2 id="it" className="text-3xl">Day-by-day itinerary</h2>
              <ol className="mt-6 space-y-0 border-l-2 border-teal-100">
                {p.itinerary.map((d) => (
                  <li key={`${d.day}-${d.title}`} className="relative pb-8 pl-8 last:pb-0">
                    <span className="absolute -left-[11px] top-0.5 flex size-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">{d.day}</span>
                    <h3 className="text-lg">Day {d.day}: {d.title}</h3>
                    <p className="mt-1 text-[15px] leading-7 text-muted">{d.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {p.inclusions.length || p.exclusions.length ? (
            <section aria-labelledby="inc" className="grid gap-6 sm:grid-cols-2">
              <h2 id="inc" className="sr-only">Inclusions and exclusions</h2>
              {p.inclusions.length ? (
                <div className="card p-6">
                  <h3 className="text-lg">Included</h3>
                  <ul className="mt-3 space-y-2 text-sm">{p.inclusions.map((x) => <li key={x} className="flex gap-2"><span aria-hidden className="text-teal-600">✓</span>{x}</li>)}</ul>
                </div>
              ) : null}
              {p.exclusions.length ? (
                <div className="card p-6">
                  <h3 className="text-lg">Not included</h3>
                  <ul className="mt-3 space-y-2 text-sm">{p.exclusions.map((x) => <li key={x} className="flex gap-2"><span aria-hidden className="text-muted">✕</span>{x}</li>)}</ul>
                </div>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="det">
            <h2 id="det" className="text-3xl">Arrangements and conditions</h2>
            <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
              <Fact label="Duration" value={durationLabel(p)} />
              <Fact label="Hotel category" value={p.hotel_category} />
              <Fact label="Transport" value={p.transport} />
              <Fact label="Meals" value={p.meals} />
              <Fact label="Minimum travellers" value={p.min_travellers ? String(p.min_travellers) : null} />
              <Fact label="Validity" value={validity} />
              <Fact label="Suitable for" value={p.audiences.map((a) => t.audiences[a as keyof typeof t.audiences] ?? a).join(", ")} />
              <Fact label="Travel style" value={p.travel_styles.join(", ")} />
            </dl>
            {p.visa_notes ? (
              <div className="mt-6">
                <h3 className="text-lg">Visa notes</h3>
                <p className="mt-1 text-[15px] leading-7 text-muted">{p.visa_notes}</p>
                <p className="mt-1 text-xs text-muted">Visa decisions rest with the relevant authority.</p>
              </div>
            ) : null}
            {p.cancellation_conditions ? (
              <div className="mt-6">
                <h3 className="text-lg">Cancellation conditions</h3>
                <p className="mt-1 text-[15px] leading-7 text-muted">{p.cancellation_conditions}</p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-5 lg:sticky lg:top-24">
            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Price</p>
              <p className="mt-1 font-serif text-3xl text-navy-900">{priceLabel(p)}</p>
              {p.price_mode !== "on_request" ? (
                <div className="mt-2 space-y-1 text-sm text-muted">
                  {p.price_basis ? <p>{p.price_basis}</p> : null}
                  {p.price_conditions ? <p>{p.price_conditions}</p> : null}
                  {p.price_updated_at ? <p>Price last updated {formatDate(p.price_updated_at)}.</p> : null}
                  <p>Subject to availability and confirmation in a written quotation.</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">We will prepare a quotation for your dates and group.</p>
              )}
            </div>
            <div id="inquire">
              <InquiryWidget
                types={["package"]}
                packageContext={{ slug: p.slug, title: p.title, minTravellers: p.min_travellers }}
                whatsapp={settings.whatsapp_verified ? settings.whatsapp : null}
                heading="Inquire about this package"
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
