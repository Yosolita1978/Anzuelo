import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase";
import type { Lead } from "@/lib/types";
import Filters from "@/components/Filters";
import LeadList from "@/components/LeadList";

type SearchParams = Promise<{
  brand?: string;
  platform?: string;
  status?: string;
}>;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const brand = params.brand || "";
  const platform = params.platform || "";
  const status = params.status || "";

  const hasBrand = brand.length > 0;

  let leads: Lead[] = [];

  if (hasBrand) {
    let query = supabaseServer
      .from("leads")
      .select("*")
      .eq("brand", brand)
      .order("score", { ascending: false })
      .order("found_at", { ascending: false });

    if (platform) {
      query = query.eq("platform", platform);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data } = await query;
    leads = (data as Lead[]) ?? [];
  }

  const { data: lastRun } = await supabaseServer
    .from("leads")
    .select("found_at")
    .eq("status", "new")
    .order("found_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        {lastRun?.found_at && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Last run: {new Date(lastRun.found_at).toLocaleString()}
          </span>
        )}
      </div>

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
            Select a brand to see your leads
          </p>
        </div>
      ) : leads.length === 0 ? (
        <p
          className="py-16 text-center text-sm"
          style={{ color: "var(--muted)" }}
        >
          No leads match these filters.
        </p>
      ) : (
        <>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </p>
          <LeadList leads={leads} />
        </>
      )}

      <section
        className="mt-4 border-t pt-6"
        style={{ borderColor: "var(--border)" }}
      >
        <h2 className="mb-3 text-base font-semibold">Facebook Groups</h2>
        <FacebookGroups />
      </section>
    </div>
  );
}

async function FacebookGroups() {
  const { data: groups } = await supabaseServer
    .from("facebook_groups")
    .select("*")
    .order("brand");

  if (!groups || groups.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        No Facebook groups tracked yet. Add them in Supabase Studio.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g) => (
        <div
          key={g.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5 text-sm"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <span className="font-medium">{g.group_name}</span>
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{ background: "var(--background)", color: "var(--muted)" }}
          >
            {g.brand}
          </span>
          {g.group_url && (
            <a
              href={g.group_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
              className="hover:underline"
            >
              Open
            </a>
          )}
          {g.notes && (
            <span style={{ color: "var(--muted)" }}>{g.notes}</span>
          )}
        </div>
      ))}
    </div>
  );
}
