import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Preema Aviation collects, uses and protects personal information submitted through its website.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <PolicyPage slug="privacy" />;
}
