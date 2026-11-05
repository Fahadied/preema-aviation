import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import type { StaffProfile } from "@/lib/types";

/** Returns the signed-in, active staff member (verified with Supabase Auth on the server) or null. */
export const getStaff = cache(async () => {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("staff_profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || !profile.active) return { supabase, user, profile: null as StaffProfile | null };
  return { supabase, user, profile: profile as StaffProfile };
});

export async function requireStaff() {
  const s = await getStaff();
  if (!s) redirect("/admin/login");
  if (!s.profile) redirect("/admin/login?error=no-access");
  return { supabase: s.supabase, user: s.user, profile: s.profile };
}

export async function requireAdmin() {
  const s = await requireStaff();
  if (s.profile.role !== "admin") redirect("/admin?error=admin-only");
  return s;
}
