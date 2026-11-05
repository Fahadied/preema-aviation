import type { Metadata } from "next";
import Link from "next/link";
import { FaqList, PageHeader } from "@/components/ui";
import { getFaqs } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about inquiries, quotations, fares, visa assistance, changes and refunds with Preema Aviation.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const groups = Array.from(new Set(faqs.map((f) => f.category)));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <>
      <PageHeader eyebrow="FAQs" title="Frequently asked questions" intro="Clear answers about how inquiries, bookings, visas and changes work." />
      <div className="container-page max-w-4xl space-y-12 py-14 lg:py-20">
        {groups.map((g) => (
          <section key={g} aria-labelledby={`faq-${g}`}>
            <h2 id={`faq-${g}`} className="mb-4 text-2xl">{g}</h2>
            <FaqList faqs={faqs.filter((f) => f.category === g)} />
          </section>
        ))}
        {faqs.length === 0 ? <p className="text-muted">FAQs are being updated.</p> : null}
        <p className="text-muted">
          Still have a question? <Link href="/contact" className="font-semibold text-teal-700 underline">Contact us</Link>.
        </p>
      </div>
      {faqs.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /> : null}
    </>
  );
}
