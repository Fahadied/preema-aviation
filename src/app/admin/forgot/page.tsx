import { AuthForm } from "@/components/admin/AuthForm";

export const metadata = { title: "Reset password" };

export default function ForgotPage() {
  return <AuthForm mode="forgot" />;
}
