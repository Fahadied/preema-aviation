import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, PlanningSteps, SectionHeading } from "@/components/ui";
import { getSettings, publicEstablishedYear } from "@/lib/data";
import { SITE_IMAGES } from "@/lib/images";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "About us",
  description: "Preema Aviation is a Dhaka-based travel agency offering air ticketing, visa assistance, hotels, holidays and organisational travel support.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { t: "Transparency", d: "We explain prices, service fees and booking conditions before you pay, and separate supplier charges from our own fees." },
  { t: "Accuracy", d: "Names, dates and documents are checked carefully, because small mistakes in travel can be expensive." },
  { t: "Responsiveness", d: "We stay available before and after you travel — including when airlines change schedules." },
  { t: "Honest advice", d: "No guaranteed visa outcomes, no artificial urgency and no misleading offers." },
  { t: "Care with your data", d: "Personal information and travel documents are handled only by the people who need them." },
];

export default async function AboutPage() {
  const settings = await getSettings();
  const year = publicEstablishedYear(settings);
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Travel support from people who know the details"
        intro={`Preema Aviation is a travel agency based in Siddheshwari, Dhaka${year ? `, serving travellers since ${year}` : ""}.`}
      />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
        <div className="space-y-5 text-[17px] leading-8 text-muted lg:col-span-6">
          <p>
            We help individuals, families, businesses and non-governmental organisations organise travel from Bangladesh —
            domestic and international air tickets, visa assistance, hotel bookings, tour packages, group travel and event-related
            trips.
          </p>
          <p>
            Our approach is simple: understand what you need, find suitable options, and explain the conditions clearly before
            anything is confirmed. After you book, we remain your point of contact for schedule changes, reissues, cancellations
            and refund requests, subject to the airline or supplier’s rules.
          </p>
          <p>
            Whether you are planning a family holiday, applying for a visa for the first time, or arranging travel for a project
            team, you will deal with a consultant who takes responsibility for your inquiry.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/plan-your-trip" className="btn-primary">Plan your trip</Link>
            <Link href="/contact" className="btn-secondary">Visit our office</Link>
          </div>
        </div>
        <figure className="lg:col-span-5 lg:col-start-8">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
            <Image src={SITE_IMAGES.about.url} alt={SITE_IMAGES.about.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <figcaption className="mt-2 text-xs text-muted">Ratargul, Sylhet. Photo: {SITE_IMAGES.about.credit}</figcaption>
        </figure>
      </section>
      <section className="border-y border-line bg-white py-16 lg:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="What we stand for" title="How we work" />
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.t} className="border-t border-line pt-5">
                <dt className="font-serif text-xl text-navy-900">{v.t}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{v.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="container-page py-16 lg:py-24">
        <SectionHeading eyebrow="Working with us" title="From first message to safe return" />
        <PlanningSteps />
      </section>
    </>
  );
}
