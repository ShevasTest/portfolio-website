import Link from "next/link";
import { DeFiAnalyticsView } from "@/components/projects/defi-analytics/DeFiAnalyticsView";
import { getDefiAnalyticsData } from "@/lib/defi-analytics";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "DeFi Analytics — SHEVAS",
  description:
    "Live DeFi analytics dashboard with TVL trends, protocol comparison, and chain rotation insights powered by DeFiLlama.",
  path: "/projects/defi-analytics",
  keywords: ["DeFiLlama", "TVL analytics", "DeFi dashboard"],
});

export const dynamic = "force-dynamic";

export default async function DeFiAnalyticsPage() {
  try {
    const data = await getDefiAnalyticsData();
    return <DeFiAnalyticsView data={data} />;
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Unknown DeFiLlama API response error.";

    return (
      <main className="relative flex min-h-screen items-center justify-center bg-bg px-6 py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/[0.1] blur-[120px]" />

        <section className="relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.08] bg-bg-glass p-7 text-center backdrop-blur-md">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 font-mono text-xs text-cyan/90">
            DeFi feed unavailable
          </p>

          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            Couldn&apos;t load DeFiLlama data right now.
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            The dashboard page is live, but the external API did not respond in time.
            Please refresh in a minute.
          </p>

          <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-xs text-text-muted">
            {reason}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/projects/defi-analytics"
              className="rounded-full border border-cyan/30 px-4 py-2 text-sm font-medium text-cyan transition-colors hover:border-cyan hover:bg-cyan/10"
            >
              Retry
            </Link>

            <Link
              href="/#projects"
              className="rounded-full border border-white/[0.14] px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-white/30 hover:text-white"
            >
              Back to portfolio
            </Link>
          </div>
        </section>
      </main>
    );
  }
}
