import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const olderThanDays = searchParams.get("older_than_days");
  const status = searchParams.get("status");

  if (!brand || !olderThanDays) {
    return NextResponse.json(
      { error: "brand and older_than_days are required" },
      { status: 400 }
    );
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
  const cutoffISO = cutoffDate.toISOString();

  // First, fetch post_ids of leads about to be deleted so we can mark them as seen
  let fetchQuery = supabaseServer
    .from("leads")
    .select("id, post_id")
    .eq("brand", brand)
    .lt("found_at", cutoffISO);

  if (status) {
    fetchQuery = fetchQuery.eq("status", status);
  }

  const { data: leadsToDelete } = await fetchQuery;

  // Mark all these posts as seen before deleting
  if (leadsToDelete && leadsToDelete.length > 0) {
    const seenRows = leadsToDelete
      .filter((l) => l.post_id)
      .map((l) => ({ post_id: l.post_id }));
    if (seenRows.length > 0) {
      await supabaseServer
        .from("seen_posts")
        .upsert(seenRows, { onConflict: "post_id" });
    }
  }

  // Now delete the leads
  let query = supabaseServer
    .from("leads")
    .delete()
    .eq("brand", brand)
    .lt("found_at", cutoffISO);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: data?.length ?? 0 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const platform = searchParams.get("platform");
  const status = searchParams.get("status");
  const minScore = searchParams.get("min_score");
  const maxScore = searchParams.get("max_score");

  if (!brand) {
    return NextResponse.json([]);
  }

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
  if (minScore) {
    query = query.gte("score", parseInt(minScore));
  }
  if (maxScore) {
    query = query.lte("score", parseInt(maxScore));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
