import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSettings, publicEstablishedYear } from "@/lib/data";
import { env } from "@/lib/env";

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  const year = publicEstablishedYear(settings);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: settings.business_name,
    url: env.siteUrl(),
    logo: `${env.siteUrl()}/brand/preema-logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Union Mahbuba Garden, 8th Floor, 86 New Circular Road, Siddheshwari",
      addressLocality: "Dhaka",
      postalCode: "1217",
      addressCountry: "BD",
    },
    ...(settings.phones[0] ? { telephone: settings.phones[0] } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(year ? { foundingDate: String(year) } : {}),
    ...(settings.map_url ? { hasMap: settings.map_url } : {}),
    sameAs: [settings.facebook_url, settings.instagram_url].filter(Boolean),
  };
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer settings={settings} year={year} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
