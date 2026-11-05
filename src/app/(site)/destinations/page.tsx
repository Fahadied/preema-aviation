import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard, PageHeader } from "@/components/ui";
import { getDestinations } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Destinations",
  description: "Destination ideas from Bangladesh and abroad — beaches, mountains, cities and heritage — to start planning your next trip with Preema Aviation.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();
  const domestic = destinations.filter((d) => d.is_domestic);
  const international = destinations.filter((d) => !d.is_domestic);
  return (
    <>
      <PageHeader
        eyebrow="Destinations"
        title="Find your next journey"
        intro="Inspiration to start planning. Every trip is tailored — tell us what you have in mind and we will suggest options."
      />
      <div className="container-page space-y-16 py-14 lg:py-20">
        {destinations.length === 0 ? (
          <p className="text-muted">Destination guides are being prepared. <Link className="text-teal-700 underline" href="/plan-your-trip?type=holiday">Tell us where you would like to go.</Link></p>
        ) : null}
        {domestic.length ? (
          <section aria-labelledby="dom">
            <h2 id="dom" className="mb-6 text-3xl">Within Bangladesh</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {domestic.map((d) => <DestinationCard key={d.id} d={d} />)}
            </div>
          </section>
        ) : null}
        {international.length ? (
          <section aria-labelledby="intl">
            <h2 id="intl" className="mb-6 text-3xl">International</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {international.map((d) => <DestinationCard key={d.id} d={d} />)}
            </div>
          </section>
        ) : null}
        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-muted">Don’t see your destination? We arrange travel to many more places.</p>
          <Link href="/plan-your-trip?type=holiday" className="btn-primary">Help me choose</Link>
        </div>
      </div>
    </>
  );
}
