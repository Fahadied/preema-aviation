import { notFound } from "next/navigation";
import { RichText } from "@/components/RichText";
import { PageHeader } from "@/components/ui";
import { getPage } from "@/lib/data";
import { formatDate } from "@/lib/format";

export async function PolicyPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <>
      <PageHeader eyebrow="Policies" title={page.title} intro={`Last updated ${formatDate(page.updated_at)}`} />
      <div className="container-page max-w-3xl py-14 lg:py-20">
        <RichText text={page.body} />
      </div>
    </>
  );
}
