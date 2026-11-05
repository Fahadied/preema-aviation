import type { Metadata } from "next";
import Link from "next/link";
import { InquiryWidget, type WidgetType } from "@/components/forms/InquiryWidget";
import { ContactActions, PageHeader } from "@/components/ui";
import { getDestination, getPackage, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Plan your trip",
  description: "Send a flight, holiday, visa assistance or hotel inquiry to Preema Aviation and receive options from a consultant.",
  alternates: { canonical: "/plan-your-trip" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const TYPES: WidgetType[] = ["flight", "holiday", "visa", "hotel"];

export default async function PlanPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [settings, pkg, dest] = await Promise.all([
    getSettings(),
    one(sp.package) ? getPackage(one(sp.package)) : Promise.resolve(null),
    one(sp.destination) ? getDestination(one(sp.destination)) : Promise.resolve(null),
  ]);
  const requested = one(sp.type) as WidgetType;
  const wa = settings.whatsapp_verified ? settings.whatsapp : null;

  let widget;
  if (pkg) {
    widget = (
      <InquiryWidget
        types={["package"]}
        packageContext={{ slug: pkg.slug, title: pkg.title, minTravellers: pkg.min_travellers }}
        whatsapp={wa}
      />
    );
  } else if (dest) {
    const types: WidgetType[] = ["destination", "flight", "hotel", "visa"];
    widget = (
      <InquiryWidget
        types={types}
        initialType={types.includes(requested) ? requested : "destination"}
        destinationContext={{ slug: dest.slug, name: dest.name }}
        whatsapp={wa}
      />
    );
  } else {
    widget = <InquiryWidget types={TYPES} initialType={TYPES.includes(requested) ? requested : "flight"} whatsapp={wa} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Plan your trip"
        title={pkg ? `Inquire about ${pkg.title}` : dest ? `Plan your trip to ${dest.name}` : "Tell us about your journey"}
        intro="Share a few details and a consultant will contact you with options. Submitting an inquiry doesn’t book or reserve anything."
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-8">{widget}</div>
        <aside className="space-y-6 lg:col-span-4">
          <div className="card p-6">
            <h2 className="text-lg">Before you send</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
              <li>Fares and availability can change until a ticket is issued.</li>
              <li>Visa decisions rest with the relevant embassy or authority.</li>
              <li>Changes and refunds follow airline and supplier rules; fees may apply.</li>
              <li>Package details and prices are confirmed in a written quotation.</li>
            </ul>
            <Link href="/terms" className="mt-3 inline-block text-sm font-semibold text-teal-700 underline">Booking conditions</Link>
          </div>
          <div className="card p-6">
            <h2 className="text-lg">Prefer to talk?</h2>
            <div className="mt-4">
              <ContactActions settings={settings} message="Hello Preema Aviation, I would like help planning a trip." />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
