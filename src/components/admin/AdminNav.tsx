"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const STAFF = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/inquiries", label: "Inquiries" },
];
const ADMIN = [
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/destinations", label: "Destinations" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/pages", label: "Policies & pages" },
  { href: "/admin/media", label: "Images" },
  { href: "/admin/settings", label: "Settings & SEO" },
  { href: "/admin/users", label: "Staff users" },
];

export function AdminNav({ isAdmin, name, role }: { isAdmin: boolean; name: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const link = (i: { href: string; label: string; exact?: boolean }) => (
    <li key={i.href}>
      <Link
        href={i.href}
        aria-current={active(i.href, i.exact) ? "page" : undefined}
        onClick={() => setOpen(false)}
        className={`block rounded-lg px-3 py-2 text-sm font-medium ${active(i.href, i.exact) ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
      >
        {i.label}
      </Link>
    </li>
  );
  return (
    <aside className="bg-navy-950 text-white lg:fixed lg:inset-y-0 lg:w-60">
      <div className="flex h-14 items-center justify-between px-4 lg:h-16">
        <Link href="/admin" className="font-serif text-lg">Preema Admin</Link>
        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="admin-nav"
          onClick={() => setOpen((o) => !o)}
        >
          Menu
        </button>
      </div>
      <nav id="admin-nav" aria-label="Admin" className={`${open ? "block" : "hidden"} px-3 pb-4 lg:block`}>
        <ul className="space-y-1">{STAFF.map(link)}</ul>
        {isAdmin ? (
          <>
            <p className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">Content & settings</p>
            <ul className="space-y-1">{ADMIN.map(link)}</ul>
          </>
        ) : null}
        <div className="mt-8 border-t border-white/10 px-3 pt-4 text-sm">
          <p className="truncate font-medium">{name}</p>
          <p className="text-xs capitalize text-white/50">{role}</p>
          <div className="mt-3 flex flex-col gap-1">
            <Link href="/admin/account" className="text-white/70 hover:text-white" onClick={() => setOpen(false)}>My account</Link>
            <Link href="/" className="text-white/70 hover:text-white" target="_blank">View website ↗</Link>
            <form action="/admin/auth/signout" method="post">
              <button type="submit" className="text-white/70 hover:text-white">Sign out</button>
            </form>
          </div>
        </div>
      </nav>
    </aside>
  );
}
