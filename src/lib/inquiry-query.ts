import "server-only";

export interface InquiryFilters {
  q?: string;
  status?: string;
  type?: string;
  assigned?: string;
  from?: string;
  to?: string;
}

const STATUSES = ["new", "contacted", "options_shared", "awaiting_customer", "confirmed", "closed", "lost"];
const TYPES = ["flight", "holiday", "visa", "hotel", "package", "destination", "corporate", "contact"];

/** Applies admin list filters. Row Level Security still decides which rows the user may see. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function inquiryQuery(supabase: any, f: InquiryFilters, userId: string, select = "*", count = false) {
  let q = supabase.from("inquiries").select(select, count ? { count: "exact" } : undefined);
  if (f.status === "open") q = q.not("status", "in", "(confirmed,closed,lost)");
  else if (f.status && STATUSES.includes(f.status)) q = q.eq("status", f.status);
  if (f.type && TYPES.includes(f.type)) q = q.eq("type", f.type);
  if (f.assigned === "me") q = q.eq("assigned_to", userId);
  else if (f.assigned === "none") q = q.is("assigned_to", null);
  else if (f.assigned && /^[0-9a-f-]{36}$/i.test(f.assigned)) q = q.eq("assigned_to", f.assigned);
  if (f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from)) q = q.gte("created_at", `${f.from}T00:00:00+06:00`);
  if (f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to)) q = q.lte("created_at", `${f.to}T23:59:59+06:00`);
  const term = (f.q ?? "").replace(/[%,()*\\]/g, " ").trim().slice(0, 80);
  if (term) {
    const like = `%${term}%`;
    q = q.or(
      ["reference", "customer_name", "customer_phone", "customer_email", "organization", "context_label"].map((c) => `${c}.ilike.${like}`).join(","),
    );
  }
  return q.order("created_at", { ascending: false });
}

export function readFilters(sp: Record<string, string | string[] | undefined>): InquiryFilters {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  return { q: one("q"), status: one("status"), type: one("type"), assigned: one("assigned"), from: one("from"), to: one("to") };
}
