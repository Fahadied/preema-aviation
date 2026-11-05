import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryWidget } from "@/components/forms/InquiryWidget";
import { RichText } from "@/components/RichText";
import { DemoBadge, Notice, PackageCard, PageHeader } from "@/components/ui";
import { getDestination, getPackages, getSettings } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestination(slug);
  if (!d) return { title: "Destination not found" };
  return {
    title: d.seo_title || `${d.name} travel ideas`,
    description: d.seo_description || d.summary,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: d.hero_image_url ? { images: [{ url: d.hero_image_url, alt: d.hero_image_alt ?? d.name }] } : undefined,
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const [d, packages, settings] = await Promise.all([getDestination(slug), getPackages(), getSettings()]);
  if (!d) notFound();
  const related = packages.filter((p) => p.destination_id === d.id);
  return (
    <>
      <PageHeader
        eyebrow={d.is_domestic ? "Bangladesh" : d.country}
        title={d.name}
        intro={d.summary}
        image={d.hero_image_url}
        imageAlt={d.hero_image_alt}
        credit={d.image_credit}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#plan" className="btn-primary">Plan a trip to {d.name}</a>
          {d.is_demo ? <DemoBadge /> : null}
        </div>
      </PageHeader>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <div className="space-y-12 lg:col-span-7">
          <section aria-labelledby="overview">
            <h2 id="overview" className="text-3xl">Overview</h2>
            <RichText text={d.overview} />
            {d.travel_styles.length ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Travel styles">
                {d.travel_styles.map((s) => <li key={s} className="chip">{s}</li>)}
              </ul>
            ) : null}
          </section>

          {d.experiences.length ? (
            <section aria-labelledby="exp">
              <h2 id="exp" className="text-3xl">Example experiences</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {d.experiences.map((x) => (
                  <li key={x} className="rounded-xl border border-line bg-white p-4 text-[15px] text-navy-900">{x}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {d.planning_notes ? (
            <section aria-labelledby="plan-notes">
              <h2 id="plan-notes" className="text-3xl">Planning considerations</h2>
              <RichText text={d.planning_notes} />
            </section>
          ) : null}

          <section aria-labelledby="visa">
            <h2 id="visa" className="text-3xl">Visa and entry information</h2>
            {d.visa_notes ? (
              <div className="mt-4 space-y-3">
                <RichText text={d.visa_notes} />
                <p className="text-sm text-muted">
                  {d.visa_reviewed_at ? `Last reviewed ${formatDate(d.visa_reviewed_at)}. ` : ""}
                  {d.visa_source ? <>Source: <a className="text-teal-700 underline" href={d.visa_source} target="_blank" rel="noopener noreferrer">official guidance</a>. </> : null}
                  Requirements can change — we confirm the current position before you apply.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <Notice>
                  Entry requirements depend on your nationality and purpose of travel and can change at short notice. Ask us and we
                  will confirm the current requirements from official sources. Visa decisions rest with the relevant authority.
                </Notice>
                <Link href={`/plan-your-trip?type=visa`} className="mt-4 inline-flex font-semibold text-teal-700 underline-offset-4 hover:underline">
                  Ask about visa assistance →
                </Link>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-5" id="plan">
          <div className="lg:sticky lg:top-24">
            <InquiryWidget
              types={["destination", "flight", "hotel", "visa"]}
              destinationContext={{ slug: d.slug, name: d.name }}
              whatsapp={settings.whatsapp_verified ? settings.whatsapp : null}
              heading={`Plan your ${d.name} trip`}
            />
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="border-t border-line bg-ivory-100 py-16">
          <div className="container-page">
            <h2 className="mb-8 text-3xl">Packages for {d.name}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <PackageCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
