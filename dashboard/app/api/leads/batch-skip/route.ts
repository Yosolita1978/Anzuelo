import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ids = body.ids as string[];

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "ids must be a non-empty array" },
      { status: 400 }
    );
  }

  // Update all leads to skipped
  const { data, error } = await supabaseServer
    .from("leads")
    .update({ status: "skipped" })
    .in("id", ids)
    .select("id, post_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark all posts as seen so the agent never re-scrapes them
  if (data && data.length > 0) {
    const seenRows = data
      .filter((l) => l.post_id)
      .map((l) => ({ post_id: l.post_id }));
    if (seenRows.length > 0) {
      await supabaseServer
        .from("seen_posts")
        .upsert(seenRows, { onConflict: "post_id" });
    }
  }

  return NextResponse.json({ skipped: data?.length ?? 0 });
}
