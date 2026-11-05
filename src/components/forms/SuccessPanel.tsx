"use client";
import { useState, type RefObject } from "react";
import { WhatsAppAction } from "@/components/WhatsAppAction";

export function SuccessPanel({
  reference,
  whatsapp,
  onReset,
  headingRef,
}: {
  reference: string;
  whatsapp?: string | null;
  onReset: () => void;
  headingRef?: RefObject<HTMLDivElement | null>;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <div ref={headingRef} tabIndex={-1} className="outline-none">
        <p className="eyebrow">Inquiry saved</p>
        <h2 className="mt-2 text-2xl sm:text-3xl">Thank you — we have your request.</h2>
      </div>
      <div className="rounded-2xl border border-teal-600/25 bg-mint-100 p-4">
        <p className="text-sm text-navy-800">Your reference number</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="font-mono text-2xl font-semibold tracking-wider text-navy-900">{reference}</span>
          <button
            type="button"
            className="text-sm font-semibold text-teal-700 underline underline-offset-2"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(reference);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div>
        <h3 className="text-lg">What happens next</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-ink marker:text-teal-600">
          <li>A Preema Aviation consultant reviews your request.</li>
          <li>We contact you using the phone number or e-mail you gave us, with options or questions.</li>
          <li>Nothing is booked or reserved until you accept a written quotation and the booking is confirmed.</li>
        </ol>
        <p className="mt-3 text-sm text-muted">Please quote your reference number whenever you contact us.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {whatsapp ? (
          <WhatsAppAction
            number={whatsapp}
            message={`Hello Preema Aviation, I have just sent an inquiry on your website. My reference is ${reference}.`}
            label="Follow up on WhatsApp"
          />
        ) : null}
        <button type="button" className="btn-secondary" onClick={onReset}>
          Send another inquiry
        </button>
      </div>
    </div>
  );
}
