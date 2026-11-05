"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { FormAlert, TextField } from "@/components/forms/fields";

type Mode = "login" | "signup" | "forgot";

export function AuthForm({ mode, initialError }: { mode: Mode; initialError?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    setError(null);
    setInfo(null);
    if (!email) return setError("Enter your e-mail address.");
    if (mode !== "forgot" && password.length < (mode === "signup" ? 12 : 1)) {
      return setError(mode === "signup" ? "Use a password of at least 12 characters." : "Enter your password.");
    }
    setBusy(true);
    const supabase = createBrowserSupabase();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? "Incorrect e-mail or password." : error.message);
        router.replace("/admin");
        router.refresh();
      } else if (mode === "signup") {
        if (password !== String(fd.get("password2") ?? "")) throw new Error("Passwords do not match.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
        });
        if (error) {
          throw new Error(
            /invitation|database error/i.test(error.message)
              ? "This e-mail address has not been invited. Ask an administrator to invite you first."
              : error.message,
          );
        }
        if (data.session) {
          router.replace("/admin");
          router.refresh();
        } else {
          setInfo("Account created. Check your e-mail and open the confirmation link, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/account`,
        });
        if (error) throw new Error(error.message);
        setInfo("If an account exists for that address, a password reset link has been sent.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "login" ? "Staff sign in" : mode === "signup" ? "Create your staff account" : "Reset your password";
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-8 font-serif text-2xl text-navy-900">Preema Aviation</Link>
      <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6 sm:p-8">
        <h1 className="text-2xl">{title}</h1>
        {mode === "signup" ? (
          <p className="text-sm text-muted">Accounts are by invitation only. Use the e-mail address an administrator invited.</p>
        ) : null}
        <TextField name="email" type="email" label="E-mail" required autoComplete="email" />
        {mode !== "forgot" ? (
          <TextField name="password" type="password" label="Password" required autoComplete={mode === "signup" ? "new-password" : "current-password"} hint={mode === "signup" ? "At least 12 characters." : undefined} />
        ) : null}
        {mode === "signup" ? <TextField name="password2" type="password" label="Confirm password" required autoComplete="new-password" /> : null}
        {error ? <FormAlert>{error}</FormAlert> : null}
        {info ? <FormAlert tone="info">{info}</FormAlert> : null}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
        </button>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          {mode !== "login" ? <Link className="text-teal-700 underline" href="/admin/login">Back to sign in</Link> : null}
          {mode === "login" ? (
            <>
              <Link className="text-teal-700 underline" href="/admin/forgot">Forgot password?</Link>
              <Link className="text-teal-700 underline" href="/admin/signup">Invited? Create account</Link>
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}
