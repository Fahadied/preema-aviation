import { z } from "zod";

/** Shared validation for public inquiry forms (used in the browser and again on the server). */

const today = () => {
  // Compare dates in Bangladesh time so "today" is accepted everywhere.
  const now = new Date(Date.now() + 6 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
};

const trimmed = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters.`);
const requiredText = (label: string, max = 120) =>
  z.string({ required_error: `${label} is required.` }).trim().min(1, `${label} is required.`).max(max, `Please keep this under ${max} characters.`);
const optionalText = (max: number) => trimmed(max).optional().or(z.literal("")).transform((v) => v || undefined);

const isoDate = (label: string) =>
  z
    .string({ required_error: `${label} is required.` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, `Please choose a valid ${label.toLowerCase()}.`);
const futureDate = (label: string) => isoDate(label).refine((v) => v >= today(), `${label} cannot be in the past.`);
const optionalFutureDate = (label: string) =>
  z
    .string()
    .optional()
    .transform((v) => v || undefined)
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), `Please choose a valid ${label.toLowerCase()}.`)
    .refine((v) => !v || v >= today(), `${label} cannot be in the past.`);

const count = (label: string, min: number, max: number) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a number.` })
    .int(`${label} must be a whole number.`)
    .min(min, `${label} must be at least ${min}.`)
    .max(max, `${label} cannot be more than ${max}.`);

const optionalAmount = z
  .union([z.literal(""), z.coerce.number().min(0, "Budget cannot be negative.").max(100_000_000)])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

export const CURRENCY_CODES = ["BDT", "USD", "EUR", "GBP", "AED", "SAR", "MYR", "SGD", "THB", "INR"] as const;

export const contactSchema = z.object({
  customer_name: requiredText("Your name", 120).refine((v) => v.length >= 2, "Please enter your full name."),
  customer_phone: z
    .string({ required_error: "Phone number is required." })
    .trim()
    .min(1, "Phone number is required.")
    .max(30, "Please enter a valid phone number.")
    .refine((v) => /^[+\d][\d\s\-()]*$/.test(v) && v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15,
      "Please enter a valid phone number, e.g. +8801XXXXXXXXX."),
  customer_email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined)
    .refine((v) => !v || z.string().email().safeParse(v).success, "Please enter a valid e-mail address."),
  privacy_ack: z.literal(true, { errorMap: () => ({ message: "Please confirm you have read the privacy notice." }) }),
});

const meta = z.object({
  idempotency_key: z.string().uuid(),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot — must stay empty
  started_at: z.coerce.number().int().positive(),
  source_path: z.string().max(300).optional(),
  package_slug: z.string().max(120).optional(),
  destination_slug: z.string().max(120).optional(),
});

const legSchema = z.object({
  from: requiredText("Departure city", 80),
  to: requiredText("Destination city", 80),
  date: futureDate("Date"),
});

export const flightDetails = z
  .object({
    trip_type: z.enum(["one_way", "round_trip", "multi_city"]),
    from: optionalText(80),
    to: optionalText(80),
    depart_date: z.string().optional(),
    return_date: z.string().optional(),
    legs: z.array(legSchema).optional(),
    adults: count("Adults", 1, 9),
    children: count("Children", 0, 9),
    infants: count("Infants", 0, 9),
    cabin: z.enum(["economy", "premium_economy", "business", "first"]),
    flexible_dates: z.boolean().default(false),
    notes: optionalText(1000),
  })
  .superRefine((d, ctx) => {
    if (d.infants > d.adults) {
      ctx.addIssue({ code: "custom", path: ["infants"], message: "Each infant must travel with an adult." });
    }
    if (d.trip_type === "multi_city") {
      if (!d.legs || d.legs.length < 2) {
        ctx.addIssue({ code: "custom", path: ["legs"], message: "Add at least two flights for a multi-city trip." });
      } else if (d.legs.length > 5) {
        ctx.addIssue({ code: "custom", path: ["legs"], message: "Multi-city trips can have up to five flights." });
      } else {
        for (let i = 1; i < d.legs.length; i++) {
          if (d.legs[i].date < d.legs[i - 1].date) {
            ctx.addIssue({ code: "custom", path: ["legs", i, "date"], message: "Flights must be in date order." });
          }
        }
      }
      return;
    }
    if (!d.from) ctx.addIssue({ code: "custom", path: ["from"], message: "Departure city or airport is required." });
    if (!d.to) ctx.addIssue({ code: "custom", path: ["to"], message: "Destination city or airport is required." });
    if (d.from && d.to && d.from.toLowerCase() === d.to.toLowerCase()) {
      ctx.addIssue({ code: "custom", path: ["to"], message: "Destination must be different from departure." });
    }
    const dep = futureDate("Departure date").safeParse(d.depart_date ?? "");
    if (!dep.success) ctx.addIssue({ code: "custom", path: ["depart_date"], message: dep.error.issues[0].message });
    if (d.trip_type === "round_trip") {
      const ret = isoDate("Return date").safeParse(d.return_date ?? "");
      if (!ret.success) {
        ctx.addIssue({ code: "custom", path: ["return_date"], message: "Return date is required for a round trip." });
      } else if (d.depart_date && d.return_date! < d.depart_date) {
        ctx.addIssue({ code: "custom", path: ["return_date"], message: "Return date must be on or after the departure date." });
      }
    }
  });

export const holidayDetails = z
  .object({
    help_me_choose: z.boolean().default(false),
    destination: optionalText(120),
    date_from: optionalFutureDate("Start date"),
    date_to: optionalFutureDate("End date"),
    nights: count("Nights", 1, 60),
    adults: count("Adults", 1, 50),
    children: count("Children", 0, 30),
    budget_amount: optionalAmount,
    budget_currency: z.enum(CURRENCY_CODES).default("BDT"),
    budget_basis: z.enum(["total", "per_person"]).default("total"),
    interests: z.array(z.string().max(40)).max(12).default([]),
    notes: optionalText(1000),
  })
  .superRefine((d, ctx) => {
    if (!d.help_me_choose && !d.destination) {
      ctx.addIssue({ code: "custom", path: ["destination"], message: "Enter a destination or choose “Help me choose”." });
    }
    if (d.date_from && d.date_to && d.date_to < d.date_from) {
      ctx.addIssue({ code: "custom", path: ["date_to"], message: "End date must be after the start date." });
    }
  });

export const VISA_PURPOSES = ["Tourism", "Business", "Study", "Work", "Medical", "Family visit", "Transit", "Other"] as const;

export const visaDetails = z.object({
  destination_country: requiredText("Destination country", 80),
  nationality: requiredText("Nationality", 80),
  residence_country: requiredText("Country of residence", 80),
  purpose: z.enum(VISA_PURPOSES, { errorMap: () => ({ message: "Please choose the purpose of your visit." }) }),
  travel_date: optionalFutureDate("Intended travel date"),
  applicants: count("Number of applicants", 1, 50),
  notes: optionalText(1000),
});

export const hotelDetails = z
  .object({
    destination: requiredText("Destination", 120),
    check_in: futureDate("Check-in date"),
    check_out: isoDate("Check-out date"),
    guests: count("Guests", 1, 50),
    rooms: count("Rooms", 1, 25),
    category: z.enum(["any", "3_star", "4_star", "5_star", "apartment", "resort"]).default("any"),
    budget_amount: optionalAmount,
    budget_currency: z.enum(CURRENCY_CODES).default("BDT"),
    notes: optionalText(1000),
  })
  .superRefine((d, ctx) => {
    if (d.check_out <= d.check_in) {
      ctx.addIssue({ code: "custom", path: ["check_out"], message: "Check-out must be after check-in." });
    }
    if (d.rooms > d.guests) {
      ctx.addIssue({ code: "custom", path: ["rooms"], message: "Rooms cannot exceed the number of guests." });
    }
  });

export const packageDetails = z.object({
  preferred_date: optionalFutureDate("Preferred travel date"),
  adults: count("Adults", 1, 50),
  children: count("Children", 0, 30),
  notes: optionalText(1000),
});

export const destinationDetails = z.object({
  preferred_date: optionalFutureDate("Preferred travel date"),
  nights: count("Nights", 1, 60),
  travellers: count("Travellers", 1, 50),
  notes: optionalText(1000),
});

export const CORPORATE_SERVICES = [
  "Air ticketing",
  "Hotel bookings",
  "Visa assistance",
  "Group travel",
  "Event / conference travel",
  "After-sales support",
] as const;

export const corporateDetails = z.object({
  role: requiredText("Your role", 80),
  routes: optionalText(500),
  volume: z.enum(["1-5", "6-20", "21-50", "50+", "not_sure"]).default("not_sure"),
  services: z.array(z.enum(CORPORATE_SERVICES)).min(1, "Choose at least one service."),
  notes: optionalText(2000),
});

export const contactDetails = z.object({
  subject: optionalText(120),
  message: requiredText("Message", 2000),
});

const corporateContact = contactSchema.extend({
  organization: requiredText("Organisation name", 150),
  customer_email: z
    .string({ required_error: "Business e-mail is required." })
    .trim()
    .min(1, "Business e-mail is required.")
    .max(200)
    .email("Please enter a valid e-mail address."),
});

export const inquirySchema = z.discriminatedUnion("type", [
  contactSchema.merge(meta).extend({ type: z.literal("flight"), details: flightDetails }),
  contactSchema.merge(meta).extend({ type: z.literal("holiday"), details: holidayDetails }),
  contactSchema.merge(meta).extend({ type: z.literal("visa"), details: visaDetails }),
  contactSchema.merge(meta).extend({ type: z.literal("hotel"), details: hotelDetails }),
  contactSchema.merge(meta).extend({ type: z.literal("package"), details: packageDetails }),
  contactSchema.merge(meta).extend({ type: z.literal("destination"), details: destinationDetails }),
  corporateContact.merge(meta).extend({ type: z.literal("corporate"), details: corporateDetails }),
  contactSchema.merge(meta).extend({ type: z.literal("contact"), details: contactDetails }),
]);

export type InquiryInput = z.input<typeof inquirySchema>;
export type InquiryParsed = z.output<typeof inquirySchema>;

/** Flattens zod issues into { "details.from": "message" } for form display. */
export function issuesToFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
