import { deleteRecord, saveFaq } from "@/app/admin/actions";
import { AdminTitle, Field, Flash, PublishBadge, Select, Toggle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Faq } from "@/lib/types";

export const metadata = { title: "FAQs" };

function FaqForm({ f }: { f?: Faq }) {
  return (
    <form action={saveFaq} className="space-y-3">
      {f ? <input type="hidden" name="id" value={f.id} /> : null}
      <Field label="Question" name="question" defaultValue={f?.question} required />
      <Field label="Answer" name="answer" defaultValue={f?.answer} rows={3} required />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Category" name="category" defaultValue={f?.category ?? "General"} />
        <Field label="Sort order" name="sort_order" type="number" defaultValue={f?.sort_order ?? 0} />
        <Select label="Status" name="status" defaultValue={f?.status ?? "draft"} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} />
      </div>
      <Toggle label="Show on homepage" name="show_on_home" defaultChecked={f?.show_on_home} />
      <button type="submit" className="btn-primary">{f ? "Save" : "Add FAQ"}</button>
    </form>
  );
}

export default async function FaqsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data } = await supabase.from("faqs").select("*").order("sort_order");
  const faqs = (data ?? []) as Faq[];
  return (
    <>
      <AdminTitle title="FAQs" intro="Keep answers accurate and avoid promises about outcomes, prices or response times." />
      <Flash saved={sp.saved} error={sp.error} />
      <details className="card mb-6 p-5" open={faqs.length === 0}>
        <summary className="cursor-pointer font-semibold text-teal-700">Add a new FAQ</summary>
        <div className="mt-4"><FaqForm /></div>
      </details>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.id} className="card p-5">
            <summary className="flex cursor-pointer items-start justify-between gap-3">
              <span className="font-medium text-navy-900">{f.question}</span>
              <PublishBadge status={f.status} />
            </summary>
            <div className="mt-4">
              <FaqForm f={f} />
              <form action={deleteRecord} className="mt-3">
                <input type="hidden" name="table" value="faqs" />
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="return" value="/admin/faqs" />
                <button type="submit" className="text-sm text-danger underline">Delete</button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
