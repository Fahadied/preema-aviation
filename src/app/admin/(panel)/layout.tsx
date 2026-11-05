import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireStaff();
  return (
    <div className="lg:pl-60">
      <AdminNav isAdmin={profile.role === "admin"} name={profile.full_name || profile.email} role={profile.role} />
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
