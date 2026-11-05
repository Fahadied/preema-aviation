import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { inquirySchema, issuesToFieldErrors } from "@/lib/inquiry-schema";
import { sendStaffNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

const MIN_FILL_MS = 2500;
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 24;

function fail(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  // Same-origin only.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin && !origin.startsWith(env.siteUrl())) {
    return fail(403, "This form can only be submitted from the Preema Aviation website.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "We could not read your submission. Please try again.");
  }
  if (JSON.stringify(body).length > 20_000) return fail(413, "Your submission is too long.");

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Please check the highlighted fields.", { fieldErrors: issuesToFieldErrors(parsed.error) });
  }
  const input = parsed.data;

  // Spam protection: honeypot and minimum time on the form.
  const elapsed = Date.now() - input.started_at;
  if (input.website) return fail(400, "Your submission could not be accepted.");
  if (elapsed < MIN_FILL_MS) return fail(429, "That was very quick — please review your details and submit again.");
  if (elapsed > MAX_FORM_AGE_MS) return fail(400, "This form has expired. Please refresh the page and try again.");

  const secret = env.submitSecret();
  if (!secret) {
    console.error("INQUIRY_SUBMIT_SECRET is not configured");
    return fail(503, "Online inquiries are temporarily unavailable. Please contact us by phone or visit our office.");
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "";
  const ipHash = ip ? createHash("sha256").update(`${env.ipSalt()}:${ip}`).digest("hex").slice(0, 32) : null;

  const payload = {
    type: input.type,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_email: input.customer_email ?? null,
    organization: "organization" in input ? input.organization : null,
    details: input.details,
    package_slug: input.package_slug ?? null,
    destination_slug: input.destination_slug ?? null,
    source_path: input.source_path ?? null,
    idempotency_key: input.idempotency_key,
    ip_hash: ipHash,
    privacy_ack: input.privacy_ack,
  };

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("submit_inquiry", { p_secret: secret, p_payload: payload });
  if (error || !data) {
    console.error("submit_inquiry failed", error?.message);
    return fail(503, "We could not save your inquiry just now. Your details are still in the form — please try again.");
  }
  const result = data as {
    ok: boolean;
    error?: string;
    reference?: string;
    duplicate?: boolean;
    notify_enabled?: boolean;
    notify_emails?: string[];
  };
  if (!result.ok || !result.reference) {
    if (result.error === "rate_limited") {
      return fail(429, "We have received several inquiries from you in a short time. Please wait a few minutes or contact us directly.");
    }
    if (result.error === "unauthorized") {
      console.error("submit_inquiry rejected the server secret — check INQUIRY_SUBMIT_SECRET registration");
      return fail(503, "Online inquiries are temporarily unavailable. Please contact us by phone or visit our office.");
    }
    return fail(422, "Some details could not be accepted. Please review the form and try again.");
  }

  // The inquiry is saved. Notification problems are recorded but never turn success into failure.
  if (!result.duplicate && result.notify_enabled && result.notify_emails?.length) {
    const sent = await sendStaffNotification({
      to: result.notify_emails,
      reference: result.reference,
      type: input.type,
      name: input.customer_name,
      phone: input.customer_phone,
      email: input.customer_email,
      organization: "organization" in input ? input.organization : undefined,
      contextLabel: input.package_slug || input.destination_slug || undefined,
      details: input.details as Record<string, unknown>,
    });
    const { error: recErr } = await supabase.rpc("record_inquiry_notification", {
      p_secret: secret,
      p_reference: result.reference,
      p_status: sent.ok ? "sent" : "failed",
      p_error: sent.ok ? null : sent.error,
    });
    if (recErr) console.error("record_inquiry_notification", recErr.message);
  }

  return NextResponse.json(
    { ok: true, reference: result.reference, duplicate: Boolean(result.duplicate) },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
