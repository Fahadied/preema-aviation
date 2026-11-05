import type { Metadata } from "next";
import Link from "next/link";
import { SimpleInquiryForm } from "@/components/forms/SimpleInquiryForm";
import { WhatsAppAction } from "@/components/WhatsAppAction";
import { PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { telLink } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Contact",
  description: "Visit Preema Aviation at Union Mahbuba Garden, 86 New Circular Road, Siddheshwari, Dhaka 1217, or send us a message.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const s = await getSettings();
  const wa = s.whatsapp && s.whatsapp_verified ? s.whatsapp : null;
  return (
    <>
      <PageHeader eyebrow="Contact" title="We’d be glad to help" intro="Send us a message, visit our office, or start a detailed travel inquiry." />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <div className="space-y-8 lg:col-span-5">
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Office</h2>
            {s.address ? <address className="mt-3 not-italic leading-7 text-muted">{s.address}</address> : null}
            {s.office_hours ? (
              <p className="mt-3 text-sm"><span className="font-semibold text-navy-900">Office hours:</span> <span className="text-muted">{s.office_hours}</span></p>
            ) : null}
            {s.map_url ? (
              <a href={s.map_url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-5">Open in Google Maps</a>
            ) : null}
          </section>
          {s.phones.length || wa || s.email ? (
            <section className="card p-6 sm:p-8">
              <h2 className="text-2xl">Call, message or e-mail</h2>
              <ul className="mt-4 space-y-3">
                {s.phones.map((p) => (
                  <li key={p}><a className="text-lg font-semibold text-teal-700 hover:underline" href={telLink(p)}>{p}</a></li>
                ))}
                {s.email ? <li><a className="font-semibold text-teal-700 hover:underline" href={`mailto:${s.email}`}>{s.email}</a></li> : null}
              </ul>
              {wa ? (
                <div className="mt-5">
                  <WhatsAppAction number={wa} message="Hello Preema Aviation, I have a question about travel arrangements." />
                </div>
              ) : null}
            </section>
          ) : null}
          <section className="rounded-[var(--radius-card)] bg-navy-900 p-6 text-white sm:p-8">
            <h2 className="text-2xl text-white">Planning a specific trip?</h2>
            <p className="mt-2 text-white/80">Our trip planner collects the details a consultant needs to send you options faster.</p>
            <Link href="/plan-your-trip" className="btn mt-5 bg-white text-navy-900 hover:bg-mint-100">Plan your trip</Link>
          </section>
        </div>
        <div className="lg:col-span-7">
          <h2 className="mb-5 text-3xl">Send us a message</h2>
          <SimpleInquiryForm kind="contact" whatsapp={wa} />
        </div>
      </div>
    </>
  );
}
