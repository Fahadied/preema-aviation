import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Destination, Faq, SiteSettings, TravelPackage } from "@/lib/types";
import { durationLabel, priceLabel, telLink } from "@/lib/format";
import { WhatsAppAction } from "./WhatsAppAction";
import { optimizable } from "@/lib/images";

export function PageHeader({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  credit,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: string | null;
  imageAlt?: string | null;
  credit?: string | null;
  children?: ReactNode;
}) {
  if (image) {
    return (
      <section className="relative isolate overflow-hidden bg-navy-950">
        <Image src={image} unoptimized={!optimizable(image)} alt={imageAlt ?? ""} fill priority sizes="100vw" className="-z-10 object-cover opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-navy-950/20" />
        <div className="container-page pt-28 pb-14 sm:pt-40 sm:pb-20">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint-200">{eyebrow}</p> : null}
          <h1 className="mt-3 max-w-3xl text-4xl text-white sm:text-6xl">{title}</h1>
          {intro ? <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">{intro}</p> : null}
          {children}
        </div>
        {credit ? <p className="absolute right-3 bottom-2 text-[10px] text-white/60">Photo: {credit}</p> : null}
      </section>
    );
  }
  return (
    <section className="border-b border-line bg-ivory-100">
      <div className="container-page py-14 sm:py-20">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
        {intro ? <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{intro}</p> : null}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro, action }: { eyebrow?: string; title: string; intro?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>
        {intro ? <p className="mt-3 text-base leading-7 text-muted">{intro}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-900">
      Demo content
    </span>
  );
}

export function DestinationCard({ d, size = "md" }: { d: Destination; size?: "md" | "lg" }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="group relative block overflow-hidden rounded-[var(--radius-card)] bg-navy-900 focus-visible:outline-offset-4"
    >
      <div className={`relative ${size === "lg" ? "aspect-[4/5] sm:aspect-[5/6]" : "aspect-[4/5]"}`}>
        {d.hero_image_url ? (
          <Image
            src={d.hero_image_url}
            unoptimized={!optimizable(d.hero_image_url)}
            alt={d.hero_image_alt ?? ""}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint-200">{d.is_domestic ? "Bangladesh" : d.country}</p>
          <h3 className="mt-1 text-2xl text-white">{d.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-white/80">{d.summary}</p>
          {d.is_demo ? <div className="mt-2"><DemoBadge /></div> : null}
        </div>
      </div>
    </Link>
  );
}

export function PackageCard({ p }: { p: TravelPackage }) {
  const img = p.gallery[0];
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] bg-ivory-200">
        {img ? (
          <Image src={img.url} unoptimized={!optimizable(img.url)} alt={img.alt || p.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : null}
        {p.is_demo ? <div className="absolute top-3 left-3"><DemoBadge /></div> : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
          {[p.destination?.name, durationLabel(p)].filter(Boolean).join(" · ")}
        </p>
        <h3 className="mt-2 text-xl">
          <Link href={`/packages/${p.slug}`} className="after:absolute after:inset-0">
            {p.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{p.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-base font-semibold text-navy-900">{priceLabel(p)}</p>
            {p.price_mode !== "on_request" && p.price_basis ? <p className="text-xs text-muted">{p.price_basis}</p> : null}
          </div>
          <span aria-hidden className="text-sm font-semibold text-teal-700">View →</span>
        </div>
      </div>
    </article>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
      {faqs.map((f) => (
        <details key={f.id} className="group p-5 sm:px-6">
          <summary className="flex min-h-8 cursor-pointer list-none items-start justify-between gap-4 text-left font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
            <span>{f.question}</span>
            <span aria-hidden className="mt-0.5 text-xl leading-none text-teal-600 transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-[15px] leading-7 text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function ContactActions({ settings, message, compact = false }: { settings: SiteSettings; message: string; compact?: boolean }) {
  const wa = settings.whatsapp && settings.whatsapp_verified ? settings.whatsapp : null;
  const phone = settings.phones[0];
  if (!wa && !phone && !settings.email) {
    return compact ? null : (
      <p className="text-sm text-muted">
        Visit our office or send an inquiry using the form — our team will get back to you.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      {phone ? (
        <a href={telLink(phone)} className="btn-secondary">
          Call {phone}
        </a>
      ) : null}
      {wa ? <WhatsAppAction number={wa} message={message} /> : null}
      {settings.email ? (
        <a href={`mailto:${settings.email}`} className="btn-secondary">
          E-mail us
        </a>
      ) : null}
    </div>
  );
}

export function PlanningSteps() {
  const steps = [
    { n: "01", t: "Tell us your plans", d: "Share where, when and who is travelling using a short inquiry form — no payment, no commitment." },
    { n: "02", t: "Review your options", d: "A consultant contacts you with suitable options, a written quotation and the conditions that apply." },
    { n: "03", t: "Confirm and travel", d: "Once you accept and pay, we confirm with airlines and suppliers and stay available for changes." },
  ];
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {steps.map((s) => (
        <li key={s.n} className="relative rounded-[var(--radius-card)] border border-line bg-white p-6">
          <span className="font-serif text-4xl text-teal-600/80">{s.n}</span>
          <h3 className="mt-4 text-xl">{s.t}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">{children}</div>;
}
