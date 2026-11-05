import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { telLink } from "@/lib/format";
import { Logo } from "./Logo";

export function Footer({ settings, year }: { settings: SiteSettings; year: number | null }) {
  const socials = [
    settings.facebook_url && { label: "Facebook", url: settings.facebook_url },
    settings.instagram_url && { label: "Instagram", url: settings.instagram_url },
    ...(settings.other_links ?? []).filter((l) => l?.url && l?.label),
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <footer className="bg-navy-950 text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            Air ticketing, visa assistance, hotels, holidays and organisational travel — arranged by people who explain the
            details.{year ? ` Serving travellers since ${year}.` : ""}
          </p>
          {socials.length ? (
            <ul className="mt-5 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-mint-200 underline-offset-4 hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <nav aria-label="Explore" className="md:col-span-2">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/destinations">Destinations</Link></li>
            <li><Link className="hover:text-white" href="/packages">Tour packages</Link></li>
            <li><Link className="hover:text-white" href="/services">Services</Link></li>
            <li><Link className="hover:text-white" href="/corporate-travel">Corporate & NGO travel</Link></li>
            <li><Link className="hover:text-white" href="/plan-your-trip">Plan your trip</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company" className="md:col-span-2">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">Company</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/about">About us</Link></li>
            <li><Link className="hover:text-white" href="/faq">FAQs</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-white" href="/privacy">Privacy policy</Link></li>
            <li><Link className="hover:text-white" href="/terms">Terms & booking conditions</Link></li>
            <li><Link className="hover:text-white" href="/image-credits">Image credits</Link></li>
          </ul>
        </nav>
        <div className="md:col-span-4">
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">Visit or contact us</h2>
          {settings.address ? <address className="mt-4 text-sm not-italic leading-6">{settings.address}</address> : null}
          <ul className="mt-3 space-y-1.5 text-sm">
            {settings.phones.map((p) => (
              <li key={p}>
                <a className="hover:text-white" href={telLink(p)}>{p}</a>
              </li>
            ))}
            {settings.email ? (
              <li>
                <a className="hover:text-white" href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            ) : null}
            {settings.office_hours ? <li className="text-white/60">{settings.office_hours}</li> : null}
          </ul>
          {settings.map_url ? (
            <a href={settings.map_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-mint-200 underline-offset-4 hover:underline">
              Open in Google Maps
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/55 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.business_name}. All rights reserved.</p>
          <p>Fares, availability and visa outcomes are subject to confirmation by suppliers and authorities.</p>
        </div>
      </div>
    </footer>
  );
}
