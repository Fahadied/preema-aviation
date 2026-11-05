import type { InquiryType } from "./types";

const LABELS: Record<string, string> = {
  trip_type: "Trip type",
  from: "From",
  to: "To",
  depart_date: "Departure date",
  return_date: "Return date",
  legs: "Flights",
  adults: "Adults",
  children: "Children",
  infants: "Infants",
  cabin: "Cabin class",
  flexible_dates: "Flexible dates",
  help_me_choose: "Help me choose a destination",
  destination: "Destination",
  date_from: "Preferred start date",
  date_to: "Preferred end date",
  nights: "Nights",
  budget_amount: "Approximate budget",
  budget_currency: "Budget currency",
  budget_basis: "Budget basis",
  interests: "Interests",
  destination_country: "Destination country",
  nationality: "Applicant nationality",
  residence_country: "Country of residence",
  purpose: "Visa purpose",
  travel_date: "Intended travel date",
  applicants: "Applicants",
  check_in: "Check-in",
  check_out: "Check-out",
  guests: "Guests",
  rooms: "Rooms",
  category: "Hotel category",
  preferred_date: "Preferred travel date",
  travellers: "Travellers",
  role: "Role",
  routes: "Typical routes",
  volume: "Approx. trips per month",
  services: "Services needed",
  subject: "Subject",
  message: "Message",
  notes: "Notes",
};

const VALUE_LABELS: Record<string, string> = {
  one_way: "One-way",
  round_trip: "Round trip",
  multi_city: "Multi-city",
  economy: "Economy",
  premium_economy: "Premium economy",
  business: "Business",
  first: "First",
  total: "Total",
  per_person: "Per person",
  any: "Any",
  "3_star": "3-star",
  "4_star": "4-star",
  "5_star": "5-star",
  apartment: "Serviced apartment",
  resort: "Resort",
  not_sure: "Not sure yet",
};

function fmt(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "object" && v ? `${(v as Record<string, string>).from} → ${(v as Record<string, string>).to} on ${(v as Record<string, string>).date}` : fmt(v)))
      .join("; ");
  }
  if (value == null || value === "") return "";
  const s = String(value);
  return VALUE_LABELS[s] ?? s;
}

/** Human-readable rows for an inquiry's details object (admin view, e-mail, CSV export). */
export function detailRows(details: Record<string, unknown>): { label: string; value: string }[] {
  const order = Object.keys(LABELS);
  return Object.entries(details ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
    .map(([k, v]) => ({ label: LABELS[k] ?? k, value: fmt(v) }))
    .filter((r) => r.value !== "");
}

export function typeLabel(type: InquiryType): string {
  return (
    {
      flight: "Flight",
      holiday: "Holiday",
      visa: "Visa assistance",
      hotel: "Hotel",
      package: "Package",
      destination: "Destination",
      corporate: "Corporate / NGO",
      contact: "General",
    } as const
  )[type];
}
