"use client";
import { useState, type FormEvent } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { FormAlert, TextField } from "@/components/forms/fields";

export function ChangePassword() {
  const [msg, setMsg] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const pw = String(fd.get("password") ?? "");
    if (pw.length < 12) return setMsg({ tone: "error", text: "Use at least 12 characters." });
    if (pw !== String(fd.get("password2") ?? "")) return setMsg({ tone: "error", text: "Passwords do not match." });
    setBusy(true);
    const { error } = await createBrowserSupabase().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ tone: "error", text: error.message });
    form.reset();
    setMsg({ tone: "info", text: "Password updated." });
  }
  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-4 p-5 sm:p-6">
      <h2 className="text-lg">Change password</h2>
      <TextField name="password" type="password" label="New password" required autoComplete="new-password" hint="At least 12 characters." />
      <TextField name="password2" type="password" label="Confirm new password" required autoComplete="new-password" />
      {msg ? <FormAlert tone={msg.tone}>{msg.text}</FormAlert> : null}
      <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
    </form>
  );
}
