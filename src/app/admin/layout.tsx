import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Preema Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-ivory-100">{children}</div>;
}
