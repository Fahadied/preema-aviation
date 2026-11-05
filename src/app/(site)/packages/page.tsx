import type { Metadata } from "next";
import Link from "next/link";
import { PackageCard, PageHeader } from "@/components/ui";
import { getPackages } from "@/lib/data";
import { t } from "@/lib/i18n/en";
import type { TravelPackage } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tour packages",
  description: "Browse published tour packages from Preema Aviation and filter by destination, duration, budget, travel style and who is travelling.",
  alternates: { canonical: "/packages" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

const DURATIONS = [
  { value: "short", label: "Up to 4 days", test: (d: number) => d <= 4 },
  { value: "medium", label: "5–7 days", test: (d: number) => d >= 5 && d <= 7 },
  { value: "long", label: "8 days or more", test: (d: number) => d >= 8 },
];
const BUDGETS = [
  { value: "u50", label: "Under ৳50,000", min: 0, max: 50_000 },
  { value: "50-100", label: "৳50,000 – ৳100,000", min: 50_000, max: 100_000 },
  { value: "100-200", label: "৳100,000 – ৳200,000", min: 100_000, max: 200_000 },
  { value: "200p", label: "Over ৳200,000", min: 200_000, max: Infinity },
  { value: "request", label: "Price on request", min: -1, max: -1 },
];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v ?? "";
}

function applyFilters(all: TravelPackage[], f: Record<string, string>) {
  return all.filter((p) => {
    if (f.destination && p.destination?.slug !== f.destination) return false;
    if (f.duration) {
      const rule = DURATIONS.find((d) => d.value === f.duration);
      if (rule && (!p.duration_days || !rule.test(p.duration_days))) return false;
    }
    if (f.budget) {
      const b = BUDGETS.find((x) => x.value === f.budget);
      if (b) {
        if (b.value === "request") {
          if (p.price_mode !== "on_request") return false;
        } else {
          // Budget filters only match packages with an administrator-entered BDT price.
          if (p.price_mode === "on_request" || p.price_amount == null || p.price_currency !== "BDT") return false;
          if (p.price_amount < b.min || p.price_amount >= b.max) return false;
        }
      }
    }
    if (f.style && !p.travel_styles.includes(f.style)) return false;
    if (f.audience && !p.audiences.includes(f.audience)) return false;
    return true;
  });
}

export default async function PackagesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters = {
    destination: one(sp.destination),
    duration: one(sp.duration),
    budget: one(sp.budget),
    style: one(sp.style),
    audience: one(sp.audience),
  };
  const all = await getPackages();
  const results = applyFilters(all, filters);
  const destinations = Array.from(new Map(all.filter((p) => p.destination).map((p) => [p.destination!.slug, p.destination!.name])).entries());
  const styles = Array.from(new Set(all.flatMap((p) => p.travel_styles))).sort();
  const active = Object.values(filters).some(Boolean);

  const select = (name: keyof typeof filters, label: string, options: { value: string; label: string }[]) => (
    <div>
      <label htmlFor={`flt-${name}`} className="field-label">{label}</label>
      <select id={`flt-${name}`} name={name} defaultValue={filters[name]} className="field">
        <option value="">Any</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow="Tour packages"
        title="Packages you can make your own"
        intro="Published itineraries with clear inclusions and conditions. Prices are confirmed in a written quotation before you pay."
      />
      <div className="container-page py-12 lg:py-16">
        {all.length ? (
          <form method="get" className="card mb-10 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-6 lg:items-end" aria-label="Filter packages">
            {select("destination", "Destination", destinations.map(([value, label]) => ({ value, label })))}
            {select("duration", "Duration", DURATIONS)}
            {select("budget", "Price", BUDGETS)}
            {select("style", "Travel style", styles.map((s) => ({ value: s, label: s })))}
            {select("audience", "Travelling as", Object.entries(t.audiences).map(([value, label]) => ({ value, label })))}
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Apply</button>
              {active ? <Link href="/packages" className="btn-secondary">Clear</Link> : null}
            </div>
          </form>
        ) : null}

        <p className="mb-6 text-sm text-muted" role="status">
          {all.length === 0
            ? ""
            : `${results.length} package${results.length === 1 ? "" : "s"}${active ? " match your filters" : ""}`}
        </p>

        {results.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => <PackageCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="card flex flex-col items-start gap-4 p-8">
            <h2 className="text-2xl">{all.length === 0 ? "New packages are on the way" : "No packages match these filters"}</h2>
            <p className="max-w-xl text-muted">
              {all.length === 0
                ? "We are preparing our next set of packages. Meanwhile, tell us your plans and we will design a holiday around them."
                : "Try removing a filter, or tell us what you are looking for and we will suggest a tailor-made plan."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/plan-your-trip?type=holiday" className="btn-primary">Request a holiday plan</Link>
              {active ? <Link href="/packages" className="btn-secondary">Clear filters</Link> : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
