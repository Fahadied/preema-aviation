import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[70vh] items-center bg-ivory-50">
      <div className="container-page py-20">
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">This page has taken a different route.</h1>
        <p className="mt-4 max-w-xl text-muted">The page may have moved or is no longer published.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">Go to the homepage</Link>
          <Link href="/plan-your-trip" className="btn-secondary">Plan your trip</Link>
        </div>
      </div>
    </main>
  );
}
