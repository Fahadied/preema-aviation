import type { ReactNode } from "react";
import type { InquiryStatus } from "@/lib/types";
import { t } from "@/lib/i18n/en";

export function AdminTitle({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl">{title}</h1>
        {intro ? <p className="mt-2 max-w-2xl text-sm text-muted">{intro}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: "bg-teal-100 text-teal-700",
  contacted: "bg-sky-100 text-sky-800",
  options_shared: "bg-indigo-100 text-indigo-800",
  awaiting_customer: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
  lost: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status]}`}>{t.statuses[status]}</span>;
}

export function PublishBadge({ status, demo }: { status: string; demo?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
        {status === "published" ? "Published" : "Draft"}
      </span>
      {demo ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Demo</span> : null}
    </span>
  );
}

export function Flash({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger">{error}</div>;
  if (saved) return <div role="status" className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{saved}</div>;
  return null;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card p-10 text-center">
      <h2 className="text-xl">{title}</h2>
      {children ? <div className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</div> : null}
    </div>
  );
}

export function Field({ label, name, defaultValue, type = "text", required, hint, rows, placeholder, className }: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  hint?: string;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  const id = `a-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="text-danger" aria-hidden> *</span> : null}
      </label>
      {rows ? (
        <textarea id={id} name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} className="field font-[inherit]" aria-describedby={hint ? `${id}-h` : undefined} />
      ) : (
        <input id={id} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} step={type === "number" ? "any" : undefined} className="field" aria-describedby={hint ? `${id}-h` : undefined} />
      )}
      {hint ? <p id={`${id}-h`} className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function Select({ label, name, defaultValue, options, className }: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const id = `a-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">{label}</label>
      <select id={id} name={name} defaultValue={defaultValue ?? ""} className="field">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Toggle({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-5 accent-teal-600" />
      <span>
        <span className="font-medium text-navy-900">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="card space-y-4 p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-lg">{title}</h2>
      {children}
    </fieldset>
  );
}
