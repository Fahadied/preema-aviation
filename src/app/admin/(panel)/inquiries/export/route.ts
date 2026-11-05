import { NextResponse, type NextRequest } from "next/server";
import { getStaff } from "@/lib/auth";
import { inquiryQuery, readFilters } from "@/lib/inquiry-query";
import { detailRows, typeLabel } from "@/lib/inquiry-summary";
import { t } from "@/lib/i18n/en";
import type { Inquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const staff = await getStaff();
  if (!staff?.profile) return new NextResponse("Not authorised", { status: 401 });
  const filters = readFilters(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const { data, error } = await inquiryQuery(staff.supabase, filters, staff.profile.id).limit(5000);
  if (error) return new NextResponse("Export failed", { status: 500 });
  const { data: staffRows } = await staff.supabase.from("staff_profiles").select("id, full_name, email");
  const names = new Map(((staffRows ?? []) as { id: string; full_name: string; email: string }[]).map((s) => [s.id, s.full_name || s.email]));
  const header = ["Reference", "Received", "Type", "Status", "Assigned to", "Customer", "Phone", "E-mail", "Organisation", "Regarding", "Details", "Notification"];
  const lines = [header.map(csvCell).join(",")];
  for (const i of (data ?? []) as Inquiry[]) {
    lines.push(
      [
        i.reference,
        i.created_at,
        typeLabel(i.type),
        t.statuses[i.status],
        i.assigned_to ? names.get(i.assigned_to) ?? "" : "",
        i.customer_name,
        i.customer_phone,
        i.customer_email ?? "",
        i.organization ?? "",
        i.context_label ?? "",
        detailRows(i.details).map((r) => `${r.label}: ${r.value}`).join(" | "),
        i.notification_status,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="preema-inquiries-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
