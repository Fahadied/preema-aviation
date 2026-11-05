import { updateMyName } from "@/app/admin/actions";
import { ChangePassword } from "@/components/admin/ChangePassword";
import { AdminTitle, Field, Flash, Section } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { profile } = await requireStaff();
  const sp = await searchParams;
  return (
    <>
      <AdminTitle title="My account" intro={`${profile.email} · ${profile.role === "admin" ? "Administrator" : "Travel consultant"}`} />
      <Flash saved={sp.saved} error={sp.error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={updateMyName}>
          <Section title="Your name">
            <Field label="Full name" name="full_name" defaultValue={profile.full_name} />
            <button type="submit" className="btn-primary">Save</button>
          </Section>
        </form>
        <ChangePassword />
      </div>
    </>
  );
}
