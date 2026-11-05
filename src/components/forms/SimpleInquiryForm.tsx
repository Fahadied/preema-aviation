"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CORPORATE_SERVICES, inquirySchema, issuesToFieldErrors } from "@/lib/inquiry-schema";
import { Checkbox, FormAlert, SelectField, TextArea, TextField } from "./fields";
import { bool, str, useInquirySubmit } from "./useInquirySubmit";
import { SuccessPanel } from "./SuccessPanel";

/** Single-step forms: corporate / NGO inquiries and general contact messages. */
export function SimpleInquiryForm({ kind, whatsapp }: { kind: "corporate" | "contact"; whatsapp?: string | null }) {
  const { state, submit, reset, fieldErrors } = useInquirySubmit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(fieldErrors).length) {
      const mapped: Record<string, string> = {};
      for (const [k, v] of Object.entries(fieldErrors)) mapped[k.replace(/^details\./, "")] = v;
      setErrors(mapped);
    }
  }, [fieldErrors]);
  useEffect(() => {
    if (state.kind === "success") headingRef.current?.focus();
  }, [state.kind]);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const payload =
      kind === "corporate"
        ? {
            type: "corporate" as const,
            organization: str(fd, "organization"),
            customer_name: str(fd, "customer_name"),
            customer_email: str(fd, "customer_email"),
            customer_phone: str(fd, "customer_phone"),
            privacy_ack: bool(fd, "privacy_ack"),
            details: {
              role: str(fd, "role"),
              routes: str(fd, "routes"),
              volume: str(fd, "volume"),
              services: fd.getAll("services").map(String),
              notes: str(fd, "notes"),
            },
          }
        : {
            type: "contact" as const,
            customer_name: str(fd, "customer_name"),
            customer_email: str(fd, "customer_email"),
            customer_phone: str(fd, "customer_phone"),
            privacy_ack: bool(fd, "privacy_ack"),
            details: { subject: str(fd, "subject"), message: str(fd, "message") },
          };
    // Validate everything except the meta fields the hook adds.
    const check = inquirySchema.safeParse({
      ...payload,
      idempotency_key: "00000000-0000-4000-8000-000000000000",
      started_at: 1,
    });
    if (!check.success) {
      const errs = issuesToFieldErrors(check.error);
      const mapped: Record<string, string> = {};
      for (const [k, v] of Object.entries(errs)) mapped[k.replace(/^details\./, "")] = v;
      setErrors(mapped);
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setErrors({});
    await submit({ ...payload, website: str(fd, "website") });
  }

  if (state.kind === "success") {
    return (
      <div className="card p-6 sm:p-8">
        <SuccessPanel
          reference={state.reference}
          whatsapp={whatsapp}
          headingRef={headingRef}
          onReset={() => {
            formRef.current?.reset();
            reset();
          }}
        />
      </div>
    );
  }

  const e = errors;
  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-8" aria-busy={state.kind === "submitting"}>
      {kind === "corporate" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="organization" label="Organisation name" required autoComplete="organization" error={e.organization} />
            <TextField name="customer_name" label="Contact person" required autoComplete="name" error={e.customer_name} />
            <TextField name="role" label="Your role" required autoComplete="organization-title" error={e.role} />
            <TextField name="customer_email" type="email" label="Business e-mail" required autoComplete="email" inputMode="email" error={e.customer_email} />
            <TextField name="customer_phone" type="tel" label="Phone" required autoComplete="tel" inputMode="tel" placeholder="+8801XXXXXXXXX" error={e.customer_phone} />
            <SelectField
              name="volume"
              label="Approximate trips per month"
              required
              defaultValue="not_sure"
              options={[
                { value: "1-5", label: "1–5" },
                { value: "6-20", label: "6–20" },
                { value: "21-50", label: "21–50" },
                { value: "50+", label: "More than 50" },
                { value: "not_sure", label: "Not sure yet" },
              ]}
            />
          </div>
          <TextArea name="routes" label="Typical routes" placeholder="e.g. Dhaka–Singapore, Dhaka–Cox's Bazar, Dhaka–Nairobi" error={e.routes} rows={2} />
          <fieldset>
            <legend className="field-label">
              Services needed <span className="text-danger" aria-hidden>*</span>
            </legend>
            <div className="grid gap-1 sm:grid-cols-2">
              {CORPORATE_SERVICES.map((s) => (
                <Checkbox key={s} name="services" value={s} label={s} />
              ))}
            </div>
            {e.services ? <p className="field-error" role="alert">{e.services}</p> : null}
          </fieldset>
          <TextArea name="notes" label="Additional requirements" placeholder="Approval process, invoicing needs, upcoming events…" error={e.notes} rows={4} />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="customer_name" label="Full name" required autoComplete="name" error={e.customer_name} />
            <TextField name="customer_phone" type="tel" label="Phone" required autoComplete="tel" inputMode="tel" placeholder="+8801XXXXXXXXX" error={e.customer_phone} />
            <TextField name="customer_email" type="email" label="E-mail" autoComplete="email" inputMode="email" error={e.customer_email} />
            <TextField name="subject" label="Subject" error={e.subject} />
          </div>
          <TextArea name="message" label="Message" required rows={5} error={e.message} />
        </>
      )}

      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="rounded-xl bg-ivory-100 p-4 text-xs leading-5 text-muted">
        We use these details only to respond to your inquiry and never ask for passport scans or payment card details on this
        website. See our{" "}
        <Link href="/privacy" className="text-teal-700 underline">
          privacy policy
        </Link>
        .
      </p>
      <Checkbox name="privacy_ack" label="I have read the privacy notice and agree to be contacted about this inquiry." error={e.privacy_ack} />
      {state.kind === "error" ? <FormAlert>{state.message}</FormAlert> : null}
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={state.kind === "submitting"}>
          {state.kind === "submitting" ? "Sending…" : kind === "corporate" ? "Request a quote" : "Send message"}
        </button>
      </div>
    </form>
  );
}
