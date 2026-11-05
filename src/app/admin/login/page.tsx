import { AuthForm } from "@/components/admin/AuthForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const message =
    error === "no-access"
      ? "Your account does not have staff access or has been deactivated. Contact an administrator."
      : error === "link"
        ? "That link is invalid or has expired. Please try again."
        : undefined;
  return <AuthForm mode="login" initialError={message} />;
}
