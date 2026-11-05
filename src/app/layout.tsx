import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { env } from "@/lib/env";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz", "SOFT"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl()),
  title: {
    default: "Preema Aviation — Air tickets, visas, holidays and business travel from Dhaka",
    template: "%s | Preema Aviation",
  },
  description:
    "Preema Aviation is a Dhaka-based travel agency helping individuals, families, businesses and NGOs with air ticketing, visa assistance, hotels, tour packages and group travel.",
  applicationName: "Preema Aviation",
  robots: env.allowIndexing() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: "Preema Aviation", locale: "en_GB" },
};

export const viewport: Viewport = {
  themeColor: "#0b1f36",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
