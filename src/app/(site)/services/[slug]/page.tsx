import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/RichText";
import { ContactActions, PageHeader } from "@/components/ui";
import { getService, getServices, getSettings } from "@/lib/data";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return { title: "Service not found" };
  return {
    title: s.seo_title || s.title,
    description: s.seo_description || s.summary,
    alternates: { canonical: `/services/${s.slug}` },
  };
}

const PLAN_TYPE: Record<string, string> = { flight: "flight", visa: "visa", hotel: "hotel", holiday: "holiday" };

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, all, settings] = await Promise.all([getService(slug), getServices(), getSettings()]);
  if (!service) notFound();
  const planType = PLAN_TYPE[service.inquiry_type];
  const cta =
    service.inquiry_type === "corporate"
      ? { href: "/corporate-travel#corporate-inquiry", label: "Send an organisation inquiry" }
      : planType
        ? { href: `/plan-your-trip?type=${planType}`, label: "Start an inquiry" }
        : { href: "/contact", label: "Contact us" };
  return (
    <>
      <PageHeader eyebrow="Service" title={service.title} intro={service.summary}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={cta.href} className="btn-primary">{cta.label}</Link>
        </div>
      </PageHeader>
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <article className="lg:col-span-7">
          <RichText text={service.body} />
        </article>
        <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
          {service.highlights.length ? (
            <div className="card p-6">
              <h2 className="text-lg">At a glance</h2>
              <ul className="mt-3 space-y-2 text-sm text-navy-800">
                {service.highlights.map((h) => (
                  <li key={h} className="flex gap-2"><span aria-hidden className="text-teal-600">✓</span>{h}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="card p-6">
            <h2 className="text-lg">Talk to a consultant</h2>
            <p className="mt-2 text-sm text-muted">Prefer to speak to someone first?</p>
            <div className="mt-4">
              <ContactActions settings={settings} message={`Hello Preema Aviation, I would like help with ${service.title.toLowerCase()}.`} />
            </div>
          </div>
          <nav aria-label="Other services" className="card p-6">
            <h2 className="text-lg">Other services</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {all.filter((s) => s.slug !== service.slug).map((s) => (
                <li key={s.id}><Link className="text-teal-700 hover:underline" href={`/services/${s.slug}`}>{s.title}</Link></li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
