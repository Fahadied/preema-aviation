"use client";
import { useCallback, useRef, useState } from "react";

export type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; reference: string };

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // RFC4122 v4 fallback
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Submits an inquiry exactly once per form session: the idempotency key is kept across retries
 * and only replaced after a confirmed success, so double clicks and retries cannot create duplicates.
 */
export function useInquirySubmit() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const keyRef = useRef<string | null>(null);
  const startedRef = useRef<number>(0);
  const inFlight = useRef(false);

  if (keyRef.current === null && typeof window !== "undefined") {
    keyRef.current = uuid();
    startedRef.current = Date.now();
  }

  const submit = useCallback(async (payload: Record<string, unknown>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState({ kind: "submitting" });
    setFieldErrors({});
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          idempotency_key: keyRef.current ?? uuid(),
          started_at: startedRef.current || Date.now() - 60_000,
          source_path: window.location.pathname + window.location.search,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; reference: string }
        | { ok: false; error: string; fieldErrors?: Record<string, string> }
        | null;
      if (res.ok && data && data.ok) {
        setState({ kind: "success", reference: data.reference });
        return data;
      }
      if (data && !data.ok && data.fieldErrors) setFieldErrors(data.fieldErrors);
      setState({
        kind: "error",
        message: (data && !data.ok && data.error) || "We could not send your inquiry. Your details are still here — please try again.",
      });
      return data;
    } catch {
      setState({
        kind: "error",
        message: "We could not reach our server. Check your connection — your details are still here — and try again.",
      });
      return null;
    } finally {
      inFlight.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    keyRef.current = uuid();
    startedRef.current = Date.now();
    setFieldErrors({});
    setState({ kind: "idle" });
  }, []);

  return { state, submit, reset, fieldErrors, setFieldErrors };
}

/** Reads a FormData value as trimmed string. */
export function str(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v.trim() : "";
}

export function bool(fd: FormData, name: string): boolean {
  return fd.get(name) === "on" || fd.get(name) === "true";
}

/** Strips the "details." prefix used by server field errors. */
export function detailErrors(errors: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(errors)) out[k.startsWith("details.") ? k.slice(8) : k] = v;
  return out;
}
