import type { MetadataRoute } from "next";
import { getDestinations, getPackages, getServices } from "@/lib/data";
import { env } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl();
  const [services, destinations, packages] = await Promise.all([getServices(), getDestinations(), getPackages()]);
  const fixed = ["", "/about", "/services", "/destinations", "/packages", "/corporate-travel", "/contact", "/faq", "/plan-your-trip", "/privacy", "/terms"];
  return [
    ...fixed.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updated_at })),
    ...destinations.filter((d) => !d.is_demo).map((d) => ({ url: `${base}/destinations/${d.slug}`, lastModified: d.updated_at })),
    ...packages.filter((p) => !p.is_demo).map((p) => ({ url: `${base}/packages/${p.slug}`, lastModified: p.updated_at })),
  ];
}
