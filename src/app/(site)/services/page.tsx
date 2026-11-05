import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getServices } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Services",
  description: "Air ticketing, visa assistance, hotel bookings, tour packages, corporate and NGO travel, group travel and after-sales support from Preema Aviation.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Travel services, explained clearly"
        intro="Choose a service to see how we help, what to expect and how to start an inquiry."
      />
      <section className="container-page py-16 lg:py-20">
        {services.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((s, i) => (
              <article key={s.id} className="card relative flex flex-col p-6 sm:p-8">
                <span className="font-serif text-lg text-teal-600">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-3 text-2xl">
                  <Link href={`/services/${s.slug}`} className="after:absolute after:inset-0">{s.title}</Link>
                </h2>
                <p className="mt-3 leading-7 text-muted">{s.summary}</p>
                {s.highlights.length ? (
                  <ul className="mt-5 space-y-2 text-sm text-navy-800">
                    {s.highlights.map((h) => (
                      <li key={h} className="flex gap-2"><span aria-hidden className="text-teal-600">—</span>{h}</li>
                    ))}
                  </ul>
                ) : null}
                <span aria-hidden className="mt-6 text-sm font-semibold text-teal-700">Learn more →</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-muted">Service information is being updated. Please <Link className="text-teal-700 underline" href="/contact">contact us</Link>.</p>
        )}
      </section>
    </>
  );
}
