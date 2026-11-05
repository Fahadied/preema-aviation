"use client";
import type { ReactNode } from "react";

interface Base {
  name: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
}

function ids(name: string) {
  const id = `f-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  return { id, err: `${id}-err`, hint: `${id}-hint` };
}

function Label({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={id} className="field-label">
      {label}
      {required ? <span className="text-danger" aria-hidden> *</span> : <span className="ml-1 text-xs font-normal text-muted">(optional)</span>}
    </label>
  );
}

function Messages({ name, error, hint }: { name: string; error?: string; hint?: ReactNode }) {
  const i = ids(name);
  return (
    <>
      {hint && !error ? <p id={i.hint} className="field-hint">{hint}</p> : null}
      {error ? <p id={i.err} className="field-error" role="alert">{error}</p> : null}
    </>
  );
}

function describedBy(name: string, error?: string, hint?: ReactNode) {
  const i = ids(name);
  return error ? i.err : hint ? i.hint : undefined;
}

export function TextField({
  name, label, error, hint, required, className, type = "text", defaultValue, placeholder, autoComplete, inputMode, min, max, step, list,
}: Base & {
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric" | "decimal";
  min?: string | number;
  max?: string | number;
  step?: string | number;
  list?: string;
}) {
  const i = ids(name);
  return (
    <div className={className}>
      <Label id={i.id} label={label} required={required} />
      <input
        id={i.id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        list={list}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className="field"
      />
      <Messages name={name} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({
  name, label, error, hint, required, className, options, defaultValue, onChange,
}: Base & {
  options: { value: string; label: string }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const i = ids(name);
  return (
    <div className={className}>
      <Label id={i.id} label={label} required={required} />
      <div className="relative">
      <select
        id={i.id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className="field appearance-none pr-9"
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
        <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute right-3.5 top-1/2 size-3 -translate-y-1/2 text-muted"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      </div>
      <Messages name={name} error={error} hint={hint} />
    </div>
  );
}

export function TextArea({
  name, label, error, hint, required, className, defaultValue, rows = 3, placeholder,
}: Base & { defaultValue?: string; rows?: number; placeholder?: string }) {
  const i = ids(name);
  return (
    <div className={className}>
      <Label id={i.id} label={label} required={required} />
      <textarea
        id={i.id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className="field min-h-24 resize-y"
      />
      <Messages name={name} error={error} hint={hint} />
    </div>
  );
}

export function Checkbox({
  name, label, error, className, defaultChecked, value, onChange,
}: { name: string; label: ReactNode; error?: string; className?: string; defaultChecked?: boolean; value?: string; onChange?: (checked: boolean) => void }) {
  const i = ids(value ? `${name}-${value}` : name);
  return (
    <div className={className}>
      <label htmlFor={i.id} className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-ink">
        <input
          id={i.id}
          type="checkbox"
          name={name}
          value={value ?? "on"}
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? i.err : undefined}
          onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
          className="mt-0.5 size-5 shrink-0 rounded border-line accent-teal-600"
        />
        <span>{label}</span>
      </label>
      {error ? <p id={i.err} className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}

export function FormAlert({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-xl border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger"
          : "rounded-xl border border-teal-600/20 bg-mint-100 px-4 py-3 text-sm text-navy-900"
      }
    >
      {children}
    </div>
  );
}
