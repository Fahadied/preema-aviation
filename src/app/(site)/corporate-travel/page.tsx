import type { Metadata } from "next";
import Image from "next/image";
import { SimpleInquiryForm } from "@/components/forms/SimpleInquiryForm";
import { ContactActions, SectionHeading } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { SITE_IMAGES } from "@/lib/images";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Corporate & NGO travel",
  description: "Business flights, group bookings, hotel coordination, travel documentation and after-sales assistance for organisations, from Preema Aviation in Dhaka.",
  alternates: { canonical: "/corporate-travel" },
};

const OFFER = [
  { t: "Business flight arrangements", d: "Domestic and international itineraries for staff, consultants and visitors, with fare conditions explained before approval." },
  { t: "Group bookings", d: "Workshops, conferences, field visits and delegations — coordinated flights and rooms for groups of different sizes." },
  { t: "Hotel coordination", d: "Accommodation near your offices, project sites or venues, with room and cancellation terms in writing." },
  { t: "Travel documentation", d: "Guidance on visa documentation and invitation letters, and reservations that support applications." },
  { t: "Booking records", d: "Clear records of each booking — traveller, route, dates, amount and status — to support your approvals and reconciliation." },
  { t: "After-sales assistance", d: "Help with schedule changes, date changes, reissues, cancellations and refund requests under supplier rules." },
];

export default async function CorporatePage() {
  const settings = await getSettings();
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950">
        <Image src={SITE_IMAGES.corporate.url} alt={SITE_IMAGES.corporate.alt} fill priority sizes="100vw" className="-z-10 object-cover opacity-35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/30" />
        <div className="container-page py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint-200">Corporate & NGO travel</p>
          <h1 className="mt-3 max-w-3xl text-4xl text-white sm:text-6xl">Organised travel for organisations that can’t afford loose ends.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
            We support businesses, development organisations and institutions with dependable travel arrangements and records your
            team can work with.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#corporate-inquiry" className="btn-primary">Send an organisation inquiry</a>
          </div>
        </div>
        <p className="absolute right-3 bottom-2 text-[10px] text-white/55">Photo: {SITE_IMAGES.corporate.credit}</p>
      </section>

      <section className="container-page py-16 lg:py-24">
        <SectionHeading eyebrow="What we arrange" title="Support across the whole trip" />
        <div className="grid gap-x-10 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
          {OFFER.map((o, i) => (
            <div key={o.t} className="border-t border-line py-6">
              <span className="font-serif text-teal-600">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 text-xl">{o.t}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{o.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-16 lg:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">How we work with organisations</p>
            <h2 className="mt-3 text-3xl">Written quotations, clear approvals, one accountable contact.</h2>
          </div>
          <ul className="space-y-4 text-[15px] leading-7 text-muted lg:col-span-6 lg:col-start-7">
            <li><strong className="text-navy-900">Tell us how you travel.</strong> Share typical routes, approximate volume and your internal approval process.</li>
            <li><strong className="text-navy-900">Agree the working arrangement.</strong> We confirm how requests, quotations, approvals and invoices will flow.</li>
            <li><strong className="text-navy-900">Book with confidence.</strong> Each request receives options and a written quotation with the applicable conditions.</li>
            <li><strong className="text-navy-900">Stay informed.</strong> We keep booking records and help when plans change.</li>
            <li className="text-sm">Payment terms and any account arrangements are agreed individually in writing.</li>
          </ul>
        </div>
      </section>

      <section id="corporate-inquiry" className="container-page scroll-mt-24 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Organisation inquiry</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Tell us about your travel needs</h2>
            <p className="mt-4 leading-7 text-muted">A consultant will contact you to understand your requirements and propose how we can work together.</p>
            <div className="mt-6">
              <ContactActions settings={settings} message="Hello Preema Aviation, I would like to discuss corporate travel for our organisation." compact />
            </div>
          </div>
          <div className="lg:col-span-8">
            <SimpleInquiryForm kind="corporate" whatsapp={settings.whatsapp_verified ? settings.whatsapp : null} />
          </div>
        </div>
      </section>
    </>
  );
}
