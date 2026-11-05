import Image from "next/image";
import Link from "next/link";
import { InquiryWidget } from "@/components/forms/InquiryWidget";
import { ContactActions, DestinationCard, FaqList, PackageCard, PlanningSteps, SectionHeading } from "@/components/ui";
import { getDestinations, getFaqs, getPackages, getServices, getSettings, publicEstablishedYear } from "@/lib/data";
import { SITE_IMAGES } from "@/lib/images";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, services, destinations, packages, faqs] = await Promise.all([
    getSettings(),
    getServices(),
    getDestinations(),
    getPackages(),
    getFaqs(),
  ]);
  const year = publicEstablishedYear(settings);
  const featured = destinations.filter((d) => d.featured).slice(0, 6);
  const shownDestinations = featured.length >= 3 ? featured : destinations.slice(0, 6);
  const homeFaqs = faqs.filter((f) => f.show_on_home).slice(0, 6);
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
          className="-z-10 object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/90 via-navy-950/60 to-navy-950/10" />
        <div className="container-page grid gap-10 pt-16 pb-12 sm:pt-24 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-24 lg:pb-24">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mint-200">Dhaka-based travel agency</p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.05] text-white sm:text-6xl lg:text-[4.25rem]">
              A world of possibilities. <span className="italic text-mint-200">One journey away.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
              From flights and visa assistance to holidays and business travel, Preema Aviation helps bring every part of your
              journey together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/plan-your-trip" className="btn-primary">
                Plan your trip
              </Link>
              <Link href="/destinations" className="btn-ghost-light">
                Explore destinations
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6" id="plan">
            <InquiryWidget variant="hero" whatsapp={wa} />
          </div>
        </div>
        <p className="absolute right-3 bottom-2 hidden text-[10px] text-white/55 sm:block">Photo: {SITE_IMAGES.hero.credit}</p>
      </section>

      {/* Introduction */}
      <section className="container-page grid gap-10 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-5">
          <p className="eyebrow">About Preema Aviation</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">A dependable travel partner, with knowledgeable people behind every booking.</h2>
        </div>
        <div className="space-y-5 text-[17px] leading-8 text-muted lg:col-span-6 lg:col-start-7">
          <p>
            Preema Aviation is a travel agency in Siddheshwari, Dhaka{year ? `, serving travellers since ${year}` : ""}. We help
            individuals, families, businesses and NGOs arrange flights, visa applications, hotels and holidays — and we stay
            available when plans change.
          </p>
          <p>
            We explain fare conditions, supplier charges and visa limitations clearly before you commit, so you always know what
            you are paying for and what to expect.
          </p>
          <Link href="/about" className="inline-flex font-semibold text-teal-700 underline-offset-4 hover:underline">
            More about us →
          </Link>
        </div>
      </section>

      {/* Services */}
      {services.length ? (
        <section className="border-y border-line bg-white py-20 lg:py-24">
          <div className="container-page">
            <SectionHeading
              eyebrow="What we do"
              title="Every part of the journey, coordinated"
              action={<Link href="/services" className="btn-secondary">All services</Link>}
            />
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {services.map((s, i) => (
                <li key={s.id} className="border-t border-line">
                  <Link href={`/services/${s.slug}`} className="group flex gap-5 py-6">
                    <span className="font-serif text-lg text-teal-600">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-serif text-xl text-navy-900 group-hover:text-teal-700">{s.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted">{s.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Destinations */}
      {shownDestinations.length ? (
        <section className="py-20 lg:py-28">
          <div className="container-page">
            <SectionHeading
              eyebrow="Destination inspiration"
              title="Where would you like to go?"
              intro="Ideas to start planning — from Bangladesh's beaches and tea country to favourite international escapes."
              action={<Link href="/destinations" className="btn-secondary">All destinations</Link>}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shownDestinations.map((d) => (
                <DestinationCard key={d.id} d={d} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Packages */}
      <section className="bg-ivory-100 py-20 lg:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Tour packages"
            title="Published packages"
            intro="Ready-made itineraries you can adjust. Every package is confirmed in writing before you pay."
            action={packages.length ? <Link href="/packages" className="btn-secondary">Browse packages</Link> : undefined}
          />
          {packages.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.slice(0, 3).map((p) => (
                <PackageCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-muted">
                Our next set of packages is being prepared. Tell us where and when you would like to travel and we will put
                together a tailor-made plan.
              </p>
              <Link href="/plan-your-trip?type=holiday" className="btn-primary">
                Request a holiday plan
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Corporate */}
      <section className="relative isolate overflow-hidden bg-navy-900 py-20 text-white lg:py-28">
        <Image src={SITE_IMAGES.corporate.url} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-20" />
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint-200">Corporate & NGO travel</p>
            <h2 className="mt-3 text-3xl text-white sm:text-5xl">Travel arrangements your organisation can rely on.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              Flights, group bookings, hotels and documentation support for staff, consultants and delegates — with booking
              records your finance team can use and a team that helps when schedules change.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
            <Link href="/corporate-travel" className="btn bg-white text-navy-900 hover:bg-mint-100">
              Corporate travel
            </Link>
            <Link href="/corporate-travel#corporate-inquiry" className="btn-ghost-light">
              Send an organisation inquiry
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-page py-20 lg:py-28">
        <SectionHeading eyebrow="How it works" title="Planning with us takes three simple steps" />
        <PlanningSteps />
      </section>

      {/* FAQs */}
      {homeFaqs.length ? (
        <section className="border-t border-line bg-white py-20 lg:py-24">
          <div className="container-page grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Good to know</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">Frequently asked questions</h2>
              <Link href="/faq" className="mt-6 inline-flex font-semibold text-teal-700 underline-offset-4 hover:underline">
                See all FAQs →
              </Link>
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={homeFaqs} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Office */}
      <section className="container-page py-20 lg:py-24">
        <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Visit us</p>
            <h2 className="mt-3 text-3xl">Our office in Siddheshwari, Dhaka</h2>
            {settings.address ? <address className="mt-4 not-italic leading-7 text-muted">{settings.address}</address> : null}
            {settings.office_hours ? <p className="mt-2 text-sm text-muted">{settings.office_hours}</p> : null}
            {settings.map_url ? (
              <a href={settings.map_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex font-semibold text-teal-700 underline-offset-4 hover:underline">
                Get directions →
              </a>
            ) : null}
          </div>
          <div className="space-y-4 lg:justify-self-end">
            <ContactActions settings={settings} message="Hello Preema Aviation, I would like help planning a trip." />
            <Link href="/contact" className="btn-navy">
              Contact page
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
