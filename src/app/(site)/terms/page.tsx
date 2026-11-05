import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Terms and booking conditions",
  description: "How inquiries, quotations, bookings, changes and refunds work with Preema Aviation.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <PolicyPage slug="terms" />;
}
