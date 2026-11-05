/**
 * English UI strings. Add `bn.ts` with the same shape for a future Bangla version and
 * select the dictionary by locale. Content tables already carry a `locale` column.
 */
export const en = {
  nav: {
    destinations: "Destinations",
    packages: "Tour packages",
    services: "Services",
    corporate: "Corporate travel",
    about: "About",
    contact: "Contact",
    plan: "Plan your trip",
  },
  inquiryTypes: {
    flight: "Flights",
    holiday: "Holidays",
    visa: "Visa assistance",
    hotel: "Hotels",
    package: "Package",
    destination: "Destination",
    corporate: "Corporate / NGO",
    contact: "General",
  },
  statuses: {
    new: "New",
    contacted: "Contacted",
    options_shared: "Options shared",
    awaiting_customer: "Awaiting customer",
    confirmed: "Confirmed",
    closed: "Closed",
    lost: "Lost / cancelled",
  },
  audiences: {
    family: "Family",
    couple: "Couple",
    group: "Group",
    corporate: "Corporate",
  },
} as const;

export type Dictionary = typeof en;
export const t = en;
