import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase";
import type { ContentOpportunity } from "@/lib/types";
import GapList from "@/components/GapList";
import Filters from "@/components/Filters";

type SearchParams = Promise<{
  brand?: string;
}>;

export default async function GapsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const brand = params.brand || "";

  const hasBrand = brand.length > 0;

  let opportunities: ContentOpportunity[] = [];

  if (hasBrand) {
    const { data } = await supabaseServer
      .from("content_opportunities")
      .select("*")
      .eq("brand", brand)
      .eq("status", "new")
      .order("found_at", { ascending: false });

    opportunities = (data as ContentOpportunity[]) ?? [];
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Content Opportunities
      </h1>

      <Suspense fallback={null}>
        <Filters />
      </Suspense>

      {!hasBrand ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20"
          style={{ borderColor: "var(--border)" }}
        >
          <img src="/icon.png" alt="" className="h-12 w-12 opacity-40" />
          <p
            className="mt-3 text-sm font-medium"
            style={{ color: "var(--muted)" }}
          >
            Select a brand to see content opportunities
          </p>
        </div>
      ) : opportunities.length === 0 ? (
        <p
          className="py-16 text-center text-sm"
          style={{ color: "var(--muted)" }}
        >
          No content opportunities for this brand yet.
        </p>
      ) : (
        <>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {opportunities.length} opportunit{opportunities.length !== 1 ? "ies" : "y"}
          </p>
          <GapList opportunities={opportunities} />
        </>
      )}
    </div>
  );
}
