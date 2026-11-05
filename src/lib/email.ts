import "server-only";
import { env } from "@/lib/env";
import { detailRows, typeLabel } from "@/lib/inquiry-summary";
import type { InquiryType } from "@/lib/types";

interface NotifyInput {
  to: string[];
  reference: string;
  type: InquiryType;
  name: string;
  phone: string;
  email?: string;
  organization?: string;
  contextLabel?: string;
  details: Record<string, unknown>;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function emailConfigured(): boolean {
  return Boolean(env.resendKey() && env.notifyFrom());
}

/** Sends the staff notification. Returns ok:false with a reason instead of throwing. */
export async function sendStaffNotification(input: NotifyInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!emailConfigured()) return { ok: false, error: "E-mail provider not configured (RESEND_API_KEY / NOTIFY_FROM_EMAIL)." };
  const rows = [
    { label: "Reference", value: input.reference },
    { label: "Type", value: typeLabel(input.type) },
    ...(input.contextLabel ? [{ label: "Regarding", value: input.contextLabel }] : []),
    { label: "Name", value: input.name },
    { label: "Phone", value: input.phone },
    ...(input.email ? [{ label: "E-mail", value: input.email }] : []),
    ...(input.organization ? [{ label: "Organisation", value: input.organization }] : []),
    ...detailRows(input.details),
  ];
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1c2733">
<p>A new website inquiry has been saved. Open the admin panel to assign and respond.</p>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map((r) => `<tr><td style="color:#566270;vertical-align:top">${esc(r.label)}</td><td>${esc(r.value)}</td></tr>`)
    .join("")}</table>
<p><a href="${esc(env.siteUrl())}/admin/inquiries">Open inquiries</a></p></div>`;
  const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.notifyFrom(),
        to: input.to,
        subject: `New ${typeLabel(input.type).toLowerCase()} inquiry ${input.reference}`,
        html,
        text,
        ...(input.email ? { reply_to: input.email } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown e-mail error" };
  } finally {
    clearTimeout(timer);
  }
}
