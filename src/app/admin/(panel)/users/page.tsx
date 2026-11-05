import { inviteStaff, revokeInvite, updateStaff } from "@/app/admin/actions";
import { AdminTitle, Field, Flash, Section, Select } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import type { StaffProfile } from "@/lib/types";

export const metadata = { title: "Staff users" };

interface Invite { email: string; full_name: string; role: string; created_at: string; accepted_at: string | null }

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase, profile } = await requireAdmin();
  const sp = await searchParams;
  const [{ data: staff }, { data: invites }] = await Promise.all([
    supabase.from("staff_profiles").select("*").order("created_at"),
    supabase.from("staff_invitations").select("*").is("accepted_at", null).order("created_at"),
  ]);
  const roleOptions = [
    { value: "consultant", label: "Travel consultant" },
    { value: "admin", label: "Administrator" },
  ];
  return (
    <>
      <AdminTitle
        title="Staff users"
        intro="Administrators manage content, settings and users. Travel consultants work with inquiries only. Accounts are by invitation — no default passwords exist."
      />
      <Flash saved={sp.saved} error={sp.error} />
      <form action={inviteStaff} className="mb-8">
        <Section title="Invite a staff member">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="E-mail" name="email" type="email" required />
            <Field label="Full name" name="full_name" />
            <Select label="Role" name="role" defaultValue="consultant" options={roleOptions} />
          </div>
          <p className="text-sm text-muted">After inviting, ask them to open <code>/admin/signup</code>, register with this e-mail address and choose their own password.</p>
          <button type="submit" className="btn-primary">Invite</button>
        </Section>
      </form>

      {invites?.length ? (
        <section className="mb-8">
          <h2 className="mb-3 text-xl">Pending invitations</h2>
          <div className="card divide-y divide-line">
            {(invites as Invite[]).map((i) => (
              <div key={i.email} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span><strong>{i.email}</strong> · {i.role} · invited {formatDateTime(i.created_at)}</span>
                <form action={revokeInvite}>
                  <input type="hidden" name="email" value={i.email} />
                  <button type="submit" className="text-danger underline">Withdraw</button>
                </form>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <h2 className="mb-3 text-xl">Staff accounts</h2>
      <div className="space-y-3">
        {((staff ?? []) as StaffProfile[]).map((u) => (
          <form key={u.id} action={updateStaff} className="card grid gap-3 p-4 sm:grid-cols-12 sm:items-end">
            <input type="hidden" name="id" value={u.id} />
            <div className="sm:col-span-4">
              <p className="text-sm font-medium">{u.email}{u.id === profile.id ? " (you)" : ""}</p>
              <label className="sr-only" htmlFor={`n-${u.id}`}>Full name</label>
              <input id={`n-${u.id}`} name="full_name" defaultValue={u.full_name} placeholder="Full name" className="field mt-1" />
            </div>
            <div className="sm:col-span-3">
              <label className="field-label" htmlFor={`r-${u.id}`}>Role</label>
              <select id={`r-${u.id}`} name="role" defaultValue={u.role} className="field">
                {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="active" defaultChecked={u.active} className="size-5 accent-teal-600" /> Active
            </label>
            <div className="sm:col-span-3 sm:text-right">
              <button type="submit" className="btn-secondary">Save</button>
            </div>
          </form>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">Deactivated staff can no longer sign in to the admin area. At least one active administrator is always required.</p>
    </>
  );
}
