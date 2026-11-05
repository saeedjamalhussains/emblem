import Link from "next/link";
import { PageTitle } from "@/components/cards";

export default async function SubmittedPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <div className="mx-auto max-w-lg text-center">
      <PageTitle title="Application received" />
      <p className="text-muted">
        Our team will review your application. If it&apos;s approved you&apos;ll receive an invitation to set up your store.
      </p>
      {id && <p className="mt-4 font-mono text-[11px] text-muted">Reference: {id}</p>}
      <Link href="/" className="btn-ghost mt-8">Back to browsing</Link>
    </div>
  );
}
