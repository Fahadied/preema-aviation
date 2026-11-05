"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n/en";
import { Logo } from "./Logo";

const NAV = [
  { href: "/destinations", label: t.nav.destinations },
  { href: "/packages", label: t.nav.packages },
  { href: "/services", label: t.nav.services },
  { href: "/corporate-travel", label: t.nav.corporate },
  { href: "/about", label: t.nav.about },
  { href: "/contact", label: t.nav.contact },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory-50/90 backdrop-blur supports-[backdrop-filter]:bg-ivory-50/75">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors hover:text-teal-700 ${
                    isActive(n.href) ? "text-teal-700" : "text-navy-900"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/plan-your-trip" className="btn-primary hidden sm:inline-flex">
            {t.nav.plan}
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-navy-900 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-ivory-50 lg:hidden"
      >
        <nav aria-label="Mobile" className="container-page py-6">
          <ul className="divide-y divide-line">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className="flex min-h-14 items-center justify-between font-serif text-2xl text-navy-900"
                >
                  {n.label}
                  <span aria-hidden className="text-teal-600">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/plan-your-trip" className="btn-primary mt-8 w-full">
            {t.nav.plan}
          </Link>
        </nav>
      </div>
    </header>
  );
}
