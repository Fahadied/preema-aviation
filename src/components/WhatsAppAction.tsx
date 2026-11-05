"use client";
import { useRef } from "react";
import { whatsappLink } from "@/lib/format";

/**
 * Opens a short explanation before handing over to WhatsApp, so visitors understand that
 * nothing has been sent until they press Send inside WhatsApp.
 */
export function WhatsAppAction({
  number,
  message,
  label = "Message us on WhatsApp",
  className = "btn-secondary",
}: {
  number: string;
  message: string;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.showModal()}>
        <WhatsAppIcon />
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby="wa-title"
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-navy-950/60"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="p-6">
          <h2 id="wa-title" className="text-xl">
            Continue in WhatsApp
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            We’ll open WhatsApp with this message ready for you:
          </p>
          <blockquote className="mt-3 rounded-xl bg-ivory-100 p-3 text-sm text-navy-900">{message}</blockquote>
          <p className="mt-3 text-sm leading-6 text-muted">
            <strong className="text-navy-900">Your message is not sent yet.</strong> Please press <em>Send</em> inside WhatsApp
            to reach us.
          </p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={() => ref.current?.close()}>
              Cancel
            </button>
            <a
              href={whatsappLink(number, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              onClick={() => ref.current?.close()}
            >
              Open WhatsApp
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function WhatsAppIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.66 15l-1.3 4.74 4.86-1.27A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.88.75.77-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.66.31 2.78 2.78 0 0 0-.87 2.07 4.83 4.83 0 0 0 1.01 2.57 11.06 11.06 0 0 0 4.24 3.74c.59.26 1.05.41 1.41.52a3.4 3.4 0 0 0 1.56.1c.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.17-.47-.29Z" />
    </svg>
  );
}
