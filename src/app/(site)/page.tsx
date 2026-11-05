import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { QuickPlanner } from "@/components/forms/QuickPlanner";
import { SimpleInquiryForm } from "@/components/forms/SimpleInquiryForm";
import { ContactActions, DemoBadge, FaqList, PackageCard } from "@/components/ui";
import { getDestinations, getFaqs, getPackages, getServices, getSettings, publicEstablishedYear } from "@/lib/data";
import { SITE_IMAGES, optimizable } from "@/lib/images";

export const revalidate = 300;

const SERVICE_ICONS = [
  "M2.5 19h19M3.6 12.6l3.4 1 4.4-6.6 2.2.6-2.6 7.3 4.7 1.4 1.6-2.2 1.7.5-1 3.9-15.2-4.5z",
  "M6 3h12v18H6zM9 7h6M9 11h6M9 15h3",
  "M3 20V6M3 14h18v6M3 10h7a3 3 0 0 1 3 3v1",
  "M12 3v2M12 19v2M3 12h2M19 12h2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  "M4 21V8l8-5 8 5v13M9 21v-6h6v6",
  "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5",
  "M4 5h16v14H4zM4 9h16M9 13h6",
  "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4",
];

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${light ? "text-mint-200" : "text-teal-700"}`}>{children}</p>
  );
}

function Arrow() {
  return <span aria-hidden>↗</span>;
}

export default async function HomePage() {
  const [settings, services, destinations, packages, faqs] = await Promise.all([
    getSettings(),
    getServices(),
    getDestinations(),
    getPackages(),
    getFaqs(),
  ]);
  const year = publicEstablishedYear(settings);
  const featured = destinations.filter((d) => d.featured);
  const inspiration = (featured.length >= 3 ? featured : destinations).filter((d) => !d.is_domestic).slice(0, 3);
  const homeFaqs = faqs.filter((f) => f.show_on_home).slice(0, 5);
  const wa = settings.whatsapp_verified ? settings.whatsapp : null;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-950">
        <Image
          src={SITE_IMAGES.hero.url}
          alt={SITE_IMAGES.hero.alt}
          fill
          priority
          sizes="100vw"
          unoptimized={!optimizable(SITE_IMAGES.hero.url)}
          className="-z-10 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(6,31,39,0.78)] via-[rgba(6,31,39,0.45)] to-[rgba(6,31,39,0.08)]" />
        <div className="container-page flex min-h-[78vh] flex-col justify-center pt-20 pb-40 sm:min-h-[86vh] sm:pb-48">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85">From Dhaka. To the world.</p>
          <h1 className="mt-5 max-w-3xl text-[2.9rem] leading-[1.02] text-white sm:text-7xl lg:text-[5.4rem]">
            A world of possibilities.
            <span className="block italic text-mint-200">One journey away.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
            From flights and visa assistance to holidays and business travel, Preema Aviation helps bring every part of your
            journey together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#plan" className="btn bg-white text-navy-900 hover:bg-ivory-100">
              Plan your trip <Arrow />
            </a>
            <Link href="/destinations" className="btn-ghost-light">
              Explore destinations
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
            {["Air ticketing", "Holidays", "Visa assistance", "Hotels"].map((x, i) => (
              <li key={x} className="whitespace-nowrap">
                {i > 0 ? <span aria-hidden className="pr-4 text-white/40">/</span> : null}
                {x}
              </li>
            ))}
          </ul>
        </div>
        <p className="absolute right-3 bottom-2 hidden text-[10px] text-white/50 sm:block">Photo: {SITE_IMAGES.hero.credit}</p>
      </section>

      {/* Quick planner overlapping the hero */}
      <section id="plan" aria-label="Plan your trip" className="relative z-10 scroll-mt-24">
        <div className="container-page -mt-32 sm:-mt-36">
          <QuickPlanner />
          <ul className="mt-6 grid gap-3 text-sm text-navy-800 sm:grid-cols-2 lg:grid-cols-4">
            {["Personal travel guidance", "Clear booking conditions", "Support when plans change", "Based in Dhaka, Bangladesh"].map((t, i) => (
              <li key={t} className="flex items-center gap-2.5">
                <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-teal-100 text-xs text-teal-700">
                  {i === 3 ? "⌖" : "✓"}
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Destination inspiration */}
      {inspiration.length ? (
        <section className="container-page py-20 lg:py-28">
          <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Eyebrow>A little inspiration</Eyebrow>
              <h2 className="mt-3 text-4xl sm:text-5xl">Where will your story go?</h2>
            </div>
            <p className="text-[15px] leading-7 text-muted lg:col-span-4 lg:col-start-9">
              Beach days, city lights, or something completely new. Explore an idea, then let us help with the details.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {inspiration.map((d) => (
              <Link
                key={d.id}
                href={`/destinations/${d.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-navy-900"
              >
                {d.hero_image_url ? (
                  <Image
                    src={d.hero_image_url}
                    alt={d.hero_image_alt ?? ""}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    unoptimized={!optimizable(d.hero_image_url)}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,31,39,0.88)] via-[rgba(6,31,39,0.15)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                      {d.travel_styles.slice(0, 2).join(" & ") || d.country}
                    </p>
                    <h3 className="mt-2 text-3xl text-white">{d.name}</h3>
                    <p className="mt-1 text-sm text-white/80">{d.summary}</p>
                    {d.is_demo ? <div className="mt-2"><DemoBadge /></div> : null}
                  </div>
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors group-hover:bg-white group-hover:text-navy-900"
                  >
                    ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              Destination inspiration only. Itineraries, availability, visa requirements and quotations are confirmed on inquiry.
            </p>
            <Link href="/destinations" className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline">
              All destinations <Arrow />
            </Link>
          </div>
        </section>
      ) : null}

      {/* Services */}
      {services.length ? (
        <section className="border-y border-line bg-ivory-100/60 py-20 lg:py-24">
          <div className="container-page">
            <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <Eyebrow>The details, taken care of</Eyebrow>
                <h2 className="mt-3 text-4xl sm:text-5xl">Every journey. Thoughtfully arranged.</h2>
              </div>
              <p className="text-[15px] leading-7 text-muted lg:col-span-4 lg:col-start-9">
                One place to coordinate the arrangements, with a person to guide you along the way.
              </p>
            </div>
            <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s, i) => (
                <li key={s.id}>
                  <Link href={`/services/${s.slug}`} className="group block">
                    <svg aria-hidden viewBox="0 0 24 24" className="size-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={SERVICE_ICONS[i % SERVICE_ICONS.length]} />
                    </svg>
                    <h3 className="mt-4 font-sans text-base font-semibold tracking-normal text-navy-900 group-hover:text-teal-700">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{s.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Published packages (shown only when there are some) */}
      {packages.length ? (
        <section className="container-page py-20 lg:py-24">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Tour packages</Eyebrow>
              <h2 className="mt-3 text-4xl sm:text-5xl">Ready when you are.</h2>
            </div>
            <Link href="/packages" className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline">
              Browse all packages <Arrow />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 3).map((p) => (
              <PackageCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Corporate */}
      <section className="container-page py-16 lg:py-20">
        <div className="relative isolate overflow-hidden rounded-2xl bg-navy-900 px-6 py-14 text-white sm:px-12 lg:px-16 lg:py-20">
          <Image src={SITE_IMAGES.corporate.url} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-[0.12]" />
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Eyebrow light>Business moves. We help you get there.</Eyebrow>
              <h2 className="mt-4 text-4xl text-white sm:text-5xl">
                Travel that works
                <br />
                for your organisation.
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-8 text-white/80">
                From business trips to NGO field visits, coordinate your team’s travel with a dedicated point of contact.
              </p>
              <Link href="/corporate-travel#corporate-inquiry" className="btn mt-8 bg-white text-navy-900 hover:bg-mint-100">
                Discuss corporate travel <Arrow />
              </Link>
            </div>
            <ul className="space-y-0 divide-y divide-white/15 border-y border-white/15 lg:col-span-5">
              {[
                "Corporate & NGO travel coordination",
                "Individual and group air ticketing",
                "Hotel and itinerary arrangements",
                "Booking documentation and after-sales support",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 py-4 text-[15px] text-white/90">
                  <span aria-hidden className="text-mint-200">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* About + process */}
      <section className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-6">
          <Eyebrow>Your journey, our attention</Eyebrow>
          <h2 className="mt-3 text-4xl sm:text-5xl">
            Good travel starts
            <br />
            with a conversation.
          </h2>
          <div className="mt-6 space-y-4 text-[16px] leading-8 text-muted">
            <p>
              Preema Aviation is a Dhaka-based travel business{year ? `, serving travellers since ${year},` : ""} working with
              individuals, families, businesses and organisations. We bring flight ticketing, visa assistance and holiday planning
              together, so you can approach your journey with a clearer plan.
            </p>
            <p>Visit our Siddheshwari office to discuss your next trip, or send your travel request online.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-5">
            <Link href="/about" className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline">
              More about us <Arrow />
            </Link>
            <a href="#contact" className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline">
              Find our office <Arrow />
            </a>
          </div>
        </div>
        <ol className="space-y-8 lg:col-span-5 lg:col-start-8">
          {[
            { t: "Tell us what you have in mind", d: "Share your destination, travel dates, group size and priorities." },
            { t: "Explore your options", d: "Review the itinerary, a written quotation and the booking conditions that apply." },
            { t: "Confirm, then look forward to it", d: "Finalise your arrangements, with support for the next steps and any changes." },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-5 border-t border-line pt-6">
              <span className="font-serif text-2xl text-teal-600">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-sans text-base font-semibold tracking-normal text-navy-900">{s.t}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQs */}
      {homeFaqs.length ? (
        <section className="border-t border-line py-20 lg:py-24">
          <div className="container-page max-w-3xl">
            <div className="text-center">
              <Eyebrow>Before you take off</Eyebrow>
              <h2 className="mt-3 text-4xl sm:text-5xl">A few helpful answers.</h2>
            </div>
            <div className="mt-10">
              <FaqList faqs={homeFaqs} />
            </div>
            <p className="mt-6 text-center text-sm">
              <Link href="/faq" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
                See all FAQs <Arrow />
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 border-t border-line bg-[#e7ece6] py-20 lg:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Let’s make a plan</Eyebrow>
            <h2 className="mt-3 text-4xl sm:text-5xl">
              Your next journey
              <br />
              starts here.
            </h2>
            <p className="mt-5 text-[16px] leading-7 text-muted">
              Tell us a little about your trip and a Preema Aviation consultant will get back to you.
            </p>
            <div className="mt-8">
              <h3 className="font-sans text-sm font-semibold tracking-normal text-navy-900">Visit our Dhaka office</h3>
              <address className="mt-2 text-[15px] not-italic leading-7 text-muted">
                Union Mahbuba Garden, 8th Floor
                <br />
                86 New Circular Road, Siddheshwari
                <br />
                Opposite Padma Diagnostic, Dhaka 1217
              </address>
              {settings.office_hours ? <p className="mt-2 text-sm text-muted">{settings.office_hours}</p> : null}
              {settings.map_url ? (
                <a
                  href={settings.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-teal-700 underline-offset-4 hover:underline"
                >
                  Open office location in Maps <Arrow />
                </a>
              ) : null}
            </div>
            <div className="mt-8">
              <ContactActions settings={settings} message="Hello Preema Aviation, I would like help planning a trip." compact />
            </div>
          </div>
          <div className="lg:col-span-7">
            <SimpleInquiryForm kind="contact" whatsapp={wa} />
          </div>
        </div>
      </section>
    </>
  );
}
