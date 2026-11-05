import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import type { Destination, Faq, Page, Service, SiteSettings, TravelPackage } from "@/lib/types";

const LOCALE = "en";

const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  business_name: "Preema Aviation",
  tagline: null,
  phones: [],
  whatsapp: null,
  whatsapp_verified: false,
  email: null,
  office_hours: null,
  address: "Union Mahbuba Garden, 8th Floor, opposite Padma Diagnostic, 86 New Circular Road, Siddheshwari, Dhaka 1217, Bangladesh",
  map_url: null,
  facebook_url: null,
  instagram_url: null,
  other_links: [],
  established_year: null,
  show_established_year: false,
  logo_url: null,
  seo_title: null,
  seo_description: null,
  og_image_url: null,
  updated_at: new Date(0).toISOString(),
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const { data, error } = await createPublicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) {
    if (error) console.error("getSettings", error.message);
    return FALLBACK_SETTINGS;
  }
  return { ...FALLBACK_SETTINGS, ...data, other_links: Array.isArray(data.other_links) ? data.other_links : [] };
});

/** Publishable establishment year, only when the owner has confirmed it. */
export function publicEstablishedYear(s: SiteSettings): number | null {
  return s.show_established_year && s.established_year ? s.established_year : null;
}

export const getServices = cache(async (): Promise<Service[]> => {
  const { data, error } = await createPublicClient()
    .from("services")
    .select("*")
    .eq("status", "published")
    .eq("locale", LOCALE)
    .order("sort_order");
  if (error) console.error("getServices", error.message);
  return (data as Service[]) ?? [];
});

export const getService = cache(async (slug: string): Promise<Service | null> => {
  const { data } = await createPublicClient()
    .from("services")
    .select("*")
    .eq("status", "published")
    .eq("locale", LOCALE)
    .eq("slug", slug)
    .maybeSingle();
  return (data as Service) ?? null;
});

/** Demo rows are excluded unless NEXT_PUBLIC_SHOW_DEMO_CONTENT=true (development only). */
function demoFilter<Q>(q: Q): Q {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return env.showDemo() ? q : (q as any).eq("is_demo", false);
}

export const getDestinations = cache(async (): Promise<Destination[]> => {
  const q = createPublicClient()
    .from("destinations")
    .select("*")
    .eq("status", "published")
    .eq("locale", LOCALE)
    .order("sort_order");
  const { data, error } = await demoFilter(q);
  if (error) console.error("getDestinations", error.message);
  return (data as Destination[]) ?? [];
});

export const getDestination = cache(async (slug: string): Promise<Destination | null> => {
  const q = createPublicClient()
    .from("destinations")
    .select("*")
    .eq("status", "published")
    .eq("locale", LOCALE)
    .eq("slug", slug);
  const { data } = await demoFilter(q).maybeSingle();
  return (data as Destination) ?? null;
});

const PACKAGE_SELECT = "*, destination:destinations(id, slug, name, country)";

function normalisePackage(row: Record<string, unknown>): TravelPackage {
  const p = row as unknown as TravelPackage;
  return {
    ...p,
    price_amount: p.price_amount == null ? null : Number(p.price_amount),
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    itinerary: Array.isArray(p.itinerary) ? p.itinerary : [],
  };
}

export const getPackages = cache(async (): Promise<TravelPackage[]> => {
  const q = createPublicClient()
    .from("packages")
    .select(PACKAGE_SELECT)
    .eq("status", "published")
    .eq("locale", LOCALE)
    .order("sort_order");
  const { data, error } = await demoFilter(q);
  if (error) console.error("getPackages", error.message);
  return (data ?? []).map(normalisePackage);
});

export const getPackage = cache(async (slug: string): Promise<TravelPackage | null> => {
  const q = createPublicClient()
    .from("packages")
    .select(PACKAGE_SELECT)
    .eq("status", "published")
    .eq("locale", LOCALE)
    .eq("slug", slug);
  const { data } = await demoFilter(q).maybeSingle();
  return data ? normalisePackage(data) : null;
});

export const getFaqs = cache(async (): Promise<Faq[]> => {
  const { data, error } = await createPublicClient()
    .from("faqs")
    .select("*")
    .eq("status", "published")
    .eq("locale", LOCALE)
    .order("sort_order");
  if (error) console.error("getFaqs", error.message);
  return (data as Faq[]) ?? [];
});

export const getPage = cache(async (slug: string): Promise<Page | null> => {
  const { data } = await createPublicClient()
    .from("pages")
    .select("*")
    .eq("status", "published")
    .eq("locale", LOCALE)
    .eq("slug", slug)
    .maybeSingle();
  return (data as Page) ?? null;
});
