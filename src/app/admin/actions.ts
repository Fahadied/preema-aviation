"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { checked, dateOrNull, httpsUrlOrNull, intOrNull, lines, numOrNull, pipeRows, text, textOrNull } from "@/lib/form-utils";
import type { InquiryStatus } from "@/lib/types";

const STATUSES: InquiryStatus[] = ["new", "contacted", "options_shared", "awaiting_customer", "confirmed", "closed", "lost"];

function back(path: string, msg: string, isError = false): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${isError ? "error" : "saved"}=${encodeURIComponent(msg)}`);
}

function safeReturn(v: string, fallback: string) {
  return v.startsWith("/admin") ? v : fallback;
}

function refreshPublic() {
  revalidatePath("/", "layout");
}

function friendly(message: string): string {
  if (/duplicate key.*slug/i.test(message)) return "That URL slug is already used. Choose another.";
  if (/price_requires_amount/i.test(message)) return "Enter a price amount, or choose “Price on request”.";
  if (/row-level security|permission denied/i.test(message)) return "You do not have permission to do that.";
  return message;
}

// ---------------------------------------------------------------------------
// Inquiries (administrators and travel consultants)
// ---------------------------------------------------------------------------
export async function updateInquiry(fd: FormData) {
  const { supabase } = await requireStaff();
  const id = text(fd, "id");
  const status = text(fd, "status") as InquiryStatus;
  const assigned = text(fd, "assigned_to") || null;
  const path = `/admin/inquiries/${id}`;
  if (!STATUSES.includes(status)) back(path, "Choose a valid status.", true);
  const { error } = await supabase.from("inquiries").update({ status, assigned_to: assigned }).eq("id", id);
  if (error) back(path, friendly(error.message), true);
  revalidatePath("/admin", "layout");
  back(path, "Inquiry updated.");
}

export async function assignToMe(fd: FormData) {
  const { supabase, profile } = await requireStaff();
  const id = text(fd, "id");
  const { error } = await supabase.from("inquiries").update({ assigned_to: profile.id }).eq("id", id);
  if (error) back(`/admin/inquiries/${id}`, friendly(error.message), true);
  back(`/admin/inquiries/${id}`, "Assigned to you.");
}

export async function addNote(fd: FormData) {
  const { supabase, profile } = await requireStaff();
  const id = text(fd, "id");
  const body = text(fd, "body");
  const path = `/admin/inquiries/${id}`;
  if (!body) back(path, "Write a note before saving.", true);
  if (body.length > 5000) back(path, "Notes are limited to 5,000 characters.", true);
  const { error } = await supabase.from("inquiry_notes").insert({ inquiry_id: id, author_id: profile.id, body });
  if (error) back(path, friendly(error.message), true);
  back(path, "Note added.");
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------
export async function savePackage(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const title = text(fd, "title");
  const editPath = id ? `/admin/packages/${id}` : "/admin/packages/new";
  if (!title) back(editPath, "Title is required.", true);
  const priceMode = text(fd, "price_mode") as "on_request" | "fixed" | "starting_from";
  const priceAmount = numOrNull(fd, "price_amount");
  if (priceMode !== "on_request" && (priceAmount == null || priceAmount < 0)) back(editPath, "Enter a valid price, or choose “Price on request”.", true);
  if (priceMode === "starting_from" && !text(fd, "price_conditions")) back(editPath, "“Starting from” prices need the conditions that apply.", true);
  const validFrom = dateOrNull(fd, "valid_from");
  const validUntil = dateOrNull(fd, "valid_until");
  if (validFrom && validUntil && validUntil < validFrom) back(editPath, "Validity end date must be after the start date.", true);

  const itinerary = pipeRows(fd, "itinerary").map((parts, i) => ({
    day: i + 1,
    title: parts[0] ?? `Day ${i + 1}`,
    description: parts.slice(1).join(" | "),
  }));
  const gallery = pipeRows(fd, "gallery")
    .map(([url, alt, credit]) => ({ url: httpsUrlOrNull(url ?? null), alt: alt ?? "", credit: credit || undefined }))
    .filter((g) => g.url);

  const row = {
    title,
    slug: slugify(text(fd, "slug") || title),
    destination_id: text(fd, "destination_id") || null,
    summary: text(fd, "summary"),
    overview: text(fd, "overview"),
    duration_days: intOrNull(fd, "duration_days"),
    duration_nights: intOrNull(fd, "duration_nights"),
    travel_styles: lines(fd, "travel_styles"),
    audiences: fd.getAll("audiences").map(String),
    gallery,
    itinerary,
    inclusions: lines(fd, "inclusions"),
    exclusions: lines(fd, "exclusions"),
    hotel_category: textOrNull(fd, "hotel_category"),
    transport: textOrNull(fd, "transport"),
    meals: textOrNull(fd, "meals"),
    visa_notes: textOrNull(fd, "visa_notes"),
    valid_from: validFrom,
    valid_until: validUntil,
    cancellation_conditions: textOrNull(fd, "cancellation_conditions"),
    price_mode: priceMode,
    price_amount: priceMode === "on_request" ? null : priceAmount,
    price_currency: text(fd, "price_currency") || "BDT",
    price_basis: textOrNull(fd, "price_basis"),
    price_conditions: textOrNull(fd, "price_conditions"),
    price_updated_at: priceMode === "on_request" ? null : dateOrNull(fd, "price_updated_at") ?? new Date().toISOString().slice(0, 10),
    min_travellers: intOrNull(fd, "min_travellers"),
    featured: checked(fd, "featured"),
    sort_order: intOrNull(fd, "sort_order") ?? 0,
    status: text(fd, "status") === "published" ? "published" : "draft",
    is_demo: checked(fd, "is_demo"),
    seo_title: textOrNull(fd, "seo_title"),
    seo_description: textOrNull(fd, "seo_description"),
  };
  const q = id ? supabase.from("packages").update(row).eq("id", id).select("id").single() : supabase.from("packages").insert(row).select("id").single();
  const { data, error } = await q;
  if (error) back(editPath, friendly(error.message), true);
  refreshPublic();
  back(`/admin/packages/${data!.id}`, "Package saved.");
}

export async function deleteRecord(fd: FormData) {
  const { supabase } = await requireAdmin();
  const table = text(fd, "table");
  const id = text(fd, "id");
  const ret = safeReturn(text(fd, "return"), "/admin");
  if (!["packages", "destinations", "services", "faqs", "pages", "media"].includes(table)) back(ret, "Unknown record type.", true);
  if (table === "media") {
    const { data: m } = await supabase.from("media").select("storage_path").eq("id", id).maybeSingle();
    if (m?.storage_path) await supabase.storage.from("media").remove([m.storage_path]);
  }
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) back(ret, friendly(error.message), true);
  refreshPublic();
  back(ret, "Deleted.");
}

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------
export async function saveDestination(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const name = text(fd, "name");
  const editPath = id ? `/admin/destinations/${id}` : "/admin/destinations/new";
  if (!name) back(editPath, "Name is required.", true);
  const visaNotes = textOrNull(fd, "visa_notes");
  const visaReviewed = dateOrNull(fd, "visa_reviewed_at");
  if (visaNotes && !visaReviewed) back(editPath, "Add the date the visa information was last reviewed.", true);
  const row = {
    name,
    slug: slugify(text(fd, "slug") || name),
    country: text(fd, "country"),
    region: text(fd, "region"),
    is_domestic: checked(fd, "is_domestic"),
    summary: text(fd, "summary"),
    overview: text(fd, "overview"),
    travel_styles: lines(fd, "travel_styles"),
    experiences: lines(fd, "experiences"),
    planning_notes: text(fd, "planning_notes"),
    visa_notes: visaNotes,
    visa_source: httpsUrlOrNull(textOrNull(fd, "visa_source")),
    visa_reviewed_at: visaReviewed,
    hero_image_url: httpsUrlOrNull(textOrNull(fd, "hero_image_url")),
    hero_image_alt: textOrNull(fd, "hero_image_alt"),
    image_credit: textOrNull(fd, "image_credit"),
    image_source_url: httpsUrlOrNull(textOrNull(fd, "image_source_url")),
    featured: checked(fd, "featured"),
    sort_order: intOrNull(fd, "sort_order") ?? 0,
    status: text(fd, "status") === "published" ? "published" : "draft",
    is_demo: checked(fd, "is_demo"),
    seo_title: textOrNull(fd, "seo_title"),
    seo_description: textOrNull(fd, "seo_description"),
  };
  const q = id ? supabase.from("destinations").update(row).eq("id", id).select("id").single() : supabase.from("destinations").insert(row).select("id").single();
  const { data, error } = await q;
  if (error) back(editPath, friendly(error.message), true);
  refreshPublic();
  back(`/admin/destinations/${data!.id}`, "Destination saved.");
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export async function saveService(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const title = text(fd, "title");
  const editPath = id ? `/admin/services/${id}` : "/admin/services/new";
  if (!title) back(editPath, "Title is required.", true);
  const row = {
    title,
    slug: slugify(text(fd, "slug") || title),
    summary: text(fd, "summary"),
    body: text(fd, "body"),
    highlights: lines(fd, "highlights"),
    inquiry_type: text(fd, "inquiry_type") || "contact",
    image_url: httpsUrlOrNull(textOrNull(fd, "image_url")),
    image_alt: textOrNull(fd, "image_alt"),
    sort_order: intOrNull(fd, "sort_order") ?? 0,
    status: text(fd, "status") === "published" ? "published" : "draft",
    seo_title: textOrNull(fd, "seo_title"),
    seo_description: textOrNull(fd, "seo_description"),
  };
  const q = id ? supabase.from("services").update(row).eq("id", id).select("id").single() : supabase.from("services").insert(row).select("id").single();
  const { data, error } = await q;
  if (error) back(editPath, friendly(error.message), true);
  refreshPublic();
  back(`/admin/services/${data!.id}`, "Service saved.");
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------
export async function saveFaq(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const question = text(fd, "question");
  const answer = text(fd, "answer");
  if (!question || !answer) back("/admin/faqs", "Question and answer are both required.", true);
  const row = {
    question,
    answer,
    category: text(fd, "category") || "General",
    show_on_home: checked(fd, "show_on_home"),
    sort_order: intOrNull(fd, "sort_order") ?? 0,
    status: text(fd, "status") === "published" ? "published" : "draft",
  };
  const { error } = id ? await supabase.from("faqs").update(row).eq("id", id) : await supabase.from("faqs").insert(row);
  if (error) back("/admin/faqs", friendly(error.message), true);
  refreshPublic();
  back("/admin/faqs", "FAQ saved.");
}

// ---------------------------------------------------------------------------
// Pages (policies)
// ---------------------------------------------------------------------------
export async function savePage(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const title = text(fd, "title");
  if (!title) back(`/admin/pages/${id}`, "Title is required.", true);
  const { error } = await supabase
    .from("pages")
    .update({
      title,
      body: text(fd, "body"),
      needs_owner_review: !checked(fd, "owner_reviewed"),
      status: text(fd, "status") === "published" ? "published" : "draft",
      seo_title: textOrNull(fd, "seo_title"),
      seo_description: textOrNull(fd, "seo_description"),
    })
    .eq("id", id);
  if (error) back(`/admin/pages/${id}`, friendly(error.message), true);
  refreshPublic();
  back(`/admin/pages/${id}`, "Page saved.");
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function saveSettings(fd: FormData) {
  const { supabase } = await requireAdmin();
  const whatsapp = text(fd, "whatsapp").replace(/\D/g, "") || null;
  const notify = lines(fd, "notify_emails").flatMap((l) => l.split(",")).map((e) => e.trim().toLowerCase()).filter(Boolean);
  const bad = notify.find((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  if (bad) back("/admin/settings", `“${bad}” is not a valid e-mail address.`, true);
  const year = intOrNull(fd, "established_year");
  if (year != null && (year < 1900 || year > new Date().getFullYear())) back("/admin/settings", "Enter a valid establishment year.", true);
  const otherLinks = pipeRows(fd, "other_links")
    .map(([label, url]) => ({ label: label ?? "", url: httpsUrlOrNull(url ?? null) ?? "" }))
    .filter((l) => l.label && l.url);

  const { error } = await supabase
    .from("site_settings")
    .update({
      business_name: text(fd, "business_name") || "Preema Aviation",
      tagline: textOrNull(fd, "tagline"),
      phones: lines(fd, "phones"),
      whatsapp,
      whatsapp_verified: Boolean(whatsapp) && checked(fd, "whatsapp_verified"),
      email: textOrNull(fd, "email"),
      office_hours: textOrNull(fd, "office_hours"),
      address: textOrNull(fd, "address"),
      map_url: httpsUrlOrNull(textOrNull(fd, "map_url")),
      facebook_url: httpsUrlOrNull(textOrNull(fd, "facebook_url")),
      instagram_url: httpsUrlOrNull(textOrNull(fd, "instagram_url")),
      other_links: otherLinks,
      established_year: year,
      show_established_year: year != null && checked(fd, "show_established_year"),
      logo_url: httpsUrlOrNull(textOrNull(fd, "logo_url")),
      seo_title: textOrNull(fd, "seo_title"),
      seo_description: textOrNull(fd, "seo_description"),
      og_image_url: httpsUrlOrNull(textOrNull(fd, "og_image_url")),
    })
    .eq("id", 1);
  if (error) back("/admin/settings", friendly(error.message), true);
  const { error: e2 } = await supabase
    .from("private_settings")
    .update({ notify_emails: notify, email_notifications_enabled: checked(fd, "email_notifications_enabled") })
    .eq("id", 1);
  if (e2) back("/admin/settings", friendly(e2.message), true);
  refreshPublic();
  back("/admin/settings", "Settings saved.");
}

// ---------------------------------------------------------------------------
// Staff users
// ---------------------------------------------------------------------------
export async function inviteStaff(fd: FormData) {
  const { supabase, profile } = await requireAdmin();
  const email = text(fd, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back("/admin/users", "Enter a valid e-mail address.", true);
  const role = text(fd, "role") === "admin" ? "admin" : "consultant";
  const { error } = await supabase
    .from("staff_invitations")
    .upsert({ email, role, full_name: text(fd, "full_name"), invited_by: profile.id, accepted_at: null });
  if (error) back("/admin/users", friendly(error.message), true);
  back("/admin/users", `Invitation recorded. Ask ${email} to create their account at /admin/signup.`);
}

export async function revokeInvite(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("staff_invitations").delete().eq("email", text(fd, "email")).is("accepted_at", null);
  if (error) back("/admin/users", friendly(error.message), true);
  back("/admin/users", "Invitation withdrawn.");
}

export async function updateStaff(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("staff_profiles")
    .update({ role: text(fd, "role") === "admin" ? "admin" : "consultant", active: checked(fd, "active"), full_name: text(fd, "full_name") })
    .eq("id", text(fd, "id"));
  if (error) back("/admin/users", friendly(error.message), true);
  back("/admin/users", "Staff member updated.");
}

export async function updateMyName(fd: FormData) {
  const { supabase, profile } = await requireStaff();
  const { error } = await supabase.from("staff_profiles").update({ full_name: text(fd, "full_name") }).eq("id", profile.id);
  if (error) back("/admin/account", friendly(error.message), true);
  back("/admin/account", "Name updated.");
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------
export async function uploadMedia(fd: FormData) {
  const { supabase, profile } = await requireAdmin();
  const file = fd.get("file");
  const alt = text(fd, "alt");
  if (!(file instanceof File) || file.size === 0) back("/admin/media", "Choose an image to upload.", true);
  const f = file as File;
  if (!alt) back("/admin/media", "Alt text is required so the image is accessible.", true);
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(f.type)) back("/admin/media", "Upload a JPEG, PNG, WebP or AVIF image.", true);
  if (f.size > 5 * 1024 * 1024) back("/admin/media", "Images must be 5 MB or smaller.", true);
  const ext = f.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, f, { contentType: f.type, cacheControl: "31536000" });
  if (error) back("/admin/media", friendly(error.message), true);
  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
  const { error: e2 } = await supabase.from("media").insert({
    url: pub.publicUrl,
    storage_path: path,
    alt,
    credit: textOrNull(fd, "credit"),
    source_url: httpsUrlOrNull(textOrNull(fd, "source_url")),
    license: textOrNull(fd, "license"),
    uploaded_by: profile.id,
  });
  if (e2) back("/admin/media", friendly(e2.message), true);
  back("/admin/media", "Image uploaded. Copy its URL into a package, destination or setting.");
}
