export type ContentStatus = "draft" | "published";
export type StaffRole = "admin" | "consultant";
export type InquiryType =
  | "flight"
  | "holiday"
  | "visa"
  | "hotel"
  | "package"
  | "destination"
  | "corporate"
  | "contact";
export type InquiryStatus =
  | "new"
  | "contacted"
  | "options_shared"
  | "awaiting_customer"
  | "confirmed"
  | "closed"
  | "lost";
export type PriceMode = "on_request" | "fixed" | "starting_from";

export interface SiteSettings {
  id: number;
  business_name: string;
  tagline: string | null;
  phones: string[];
  whatsapp: string | null;
  whatsapp_verified: boolean;
  email: string | null;
  office_hours: string | null;
  address: string | null;
  map_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  other_links: { label: string; url: string }[];
  established_year: number | null;
  show_established_year: boolean;
  logo_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  updated_at: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  highlights: string[];
  inquiry_type: InquiryType;
  image_url: string | null;
  image_alt: string | null;
  sort_order: number;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  is_domestic: boolean;
  summary: string;
  overview: string;
  travel_styles: string[];
  experiences: string[];
  planning_notes: string;
  visa_notes: string | null;
  visa_source: string | null;
  visa_reviewed_at: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  image_credit: string | null;
  image_source_url: string | null;
  featured: boolean;
  sort_order: number;
  status: ContentStatus;
  is_demo: boolean;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
  credit?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TravelPackage {
  id: string;
  slug: string;
  title: string;
  destination_id: string | null;
  summary: string;
  overview: string;
  duration_days: number | null;
  duration_nights: number | null;
  travel_styles: string[];
  audiences: string[];
  gallery: GalleryImage[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  hotel_category: string | null;
  transport: string | null;
  meals: string | null;
  visa_notes: string | null;
  valid_from: string | null;
  valid_until: string | null;
  cancellation_conditions: string | null;
  price_mode: PriceMode;
  price_amount: number | null;
  price_currency: string;
  price_basis: string | null;
  price_conditions: string | null;
  price_updated_at: string | null;
  min_travellers: number | null;
  featured: boolean;
  sort_order: number;
  status: ContentStatus;
  is_demo: boolean;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
  destination?: Pick<Destination, "id" | "slug" | "name" | "country"> | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  show_on_home: boolean;
  sort_order: number;
  status: ContentStatus;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  body: string;
  needs_owner_review: boolean;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

export interface StaffProfile {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  active: boolean;
}

export interface Inquiry {
  id: string;
  reference: string;
  type: InquiryType;
  status: InquiryStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  organization: string | null;
  details: Record<string, unknown>;
  package_id: string | null;
  destination_id: string | null;
  context_label: string | null;
  source_path: string | null;
  assigned_to: string | null;
  privacy_ack: boolean;
  notification_status: "not_configured" | "pending" | "sent" | "failed";
  notification_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export interface InquiryEvent {
  id: string;
  inquiry_id: string;
  actor_id: string | null;
  event_type: string;
  from_value: string | null;
  to_value: string | null;
  created_at: string;
}
