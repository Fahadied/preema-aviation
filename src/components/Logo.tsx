import Image from "next/image";
import Link from "next/link";

/** Official Preema mark with the business name. Replace /public/brand files to update the logo. */
export function Logo({ tone = "dark", logoUrl }: { tone?: "dark" | "light"; logoUrl?: string | null }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Preema Aviation — home">
      <span className={tone === "light" ? "rounded-lg bg-white p-1" : ""}>
        <Image
          src={logoUrl || "/brand/preema-mark.png"}
          alt=""
          width={240}
          height={144}
          priority
          unoptimized={Boolean(logoUrl)}
          className="h-8 w-auto sm:h-9"
        />
      </span>
      <span className="leading-none">
        <span className={`block font-serif text-[1.15rem] font-semibold tracking-tight ${tone === "light" ? "text-white" : "text-navy-900"}`}>
          Preema
        </span>
        <span className={`block text-[0.62rem] font-semibold uppercase tracking-[0.32em] ${tone === "light" ? "text-mint-200" : "text-teal-700"}`}>
          Aviation
        </span>
      </span>
    </Link>
  );
}
