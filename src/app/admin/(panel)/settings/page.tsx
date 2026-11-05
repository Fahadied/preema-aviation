import { saveSettings } from "@/app/admin/actions";
import { AdminTitle, Field, Flash, Section, Toggle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import type { SiteSettings } from "@/lib/types";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const [{ data: s }, { data: priv }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("private_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  const st = (s ?? {}) as Partial<SiteSettings>;
  const pv = (priv ?? { notify_emails: [], email_notifications_enabled: false }) as { notify_emails: string[]; email_notifications_enabled: boolean };
  const mailReady = emailConfigured();
  return (
    <>
      <AdminTitle title="Settings & SEO" intro="Only enter verified details. Empty contact channels are hidden on the website automatically." />
      <Flash saved={sp.saved} error={sp.error} />
      <form action={saveSettings} className="space-y-6">
        <Section title="Business">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" name="business_name" defaultValue={st.business_name} required />
            <Field label="Tagline" name="tagline" defaultValue={st.tagline} />
            <Field label="Establishment year" name="established_year" type="number" defaultValue={st.established_year} hint="Hidden until you tick “Publish establishment year”." />
            <Field label="Logo URL (optional)" name="logo_url" defaultValue={st.logo_url} hint="Leave empty to use the official Preema mark bundled with the site." />
          </div>
          <Toggle label="Publish establishment year" name="show_established_year" defaultChecked={st.show_established_year} hint="Tick only after the owner confirms the year for publication." />
        </Section>

        <Section title="Contact channels">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone numbers (one per line)" name="phones" defaultValue={(st.phones ?? []).join("\n")} rows={3} placeholder="+880 2 XXXX XXXX" />
            <Field label="Public e-mail" name="email" type="email" defaultValue={st.email} />
            <Field label="WhatsApp number (with country code)" name="whatsapp" defaultValue={st.whatsapp} placeholder="8801XXXXXXXXX" />
            <Field label="Office hours" name="office_hours" defaultValue={st.office_hours} placeholder="Saturday–Thursday, 10:00–19:00" />
          </div>
          <Toggle label="WhatsApp number verified" name="whatsapp_verified" defaultChecked={st.whatsapp_verified} hint="WhatsApp buttons appear only when this is ticked." />
          <Field label="Office address" name="address" defaultValue={st.address} rows={2} />
          <Field label="Map link" name="map_url" defaultValue={st.map_url} />
        </Section>

        <Section title="Social links">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Facebook page URL" name="facebook_url" defaultValue={st.facebook_url} />
            <Field label="Instagram URL" name="instagram_url" defaultValue={st.instagram_url} />
          </div>
          <Field label="Other links (one per line: Label | URL)" name="other_links" defaultValue={(st.other_links ?? []).map((l) => `${l.label} | ${l.url}`).join("\n")} rows={3} />
        </Section>

        <Section title="Search engines">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default SEO title" name="seo_title" defaultValue={st.seo_title} />
            <Field label="Default social sharing image URL" name="og_image_url" defaultValue={st.og_image_url} />
          </div>
          <Field label="Default SEO description" name="seo_description" defaultValue={st.seo_description} rows={2} />
        </Section>

        <Section title="Staff e-mail notifications">
          {!mailReady ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
              The e-mail provider is not configured on the server (RESEND_API_KEY and NOTIFY_FROM_EMAIL). Notifications will be recorded as failed until it is.
            </p>
          ) : null}
          <Toggle label="E-mail staff when a new inquiry arrives" name="email_notifications_enabled" defaultChecked={pv.email_notifications_enabled} />
          <Field label="Recipients (one per line)" name="notify_emails" defaultValue={(pv.notify_emails ?? []).join("\n")} rows={3} />
        </Section>

        <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-line bg-ivory-100/95 px-4 py-3 backdrop-blur">
          <button type="submit" className="btn-primary">Save settings</button>
        </div>
      </form>
    </>
  );
}
