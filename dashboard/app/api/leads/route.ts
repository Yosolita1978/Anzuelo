import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const platform = searchParams.get("platform");
  const status = searchParams.get("status");

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

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
