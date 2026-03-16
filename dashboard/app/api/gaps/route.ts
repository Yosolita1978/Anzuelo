import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const status = searchParams.get("status");

  if (!brand) {
    return NextResponse.json([]);
  }

  let query = supabaseServer
    .from("content_opportunities")
    .select("*")
    .eq("brand", brand)
    .order("found_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  } else {
    query = query.eq("status", "new");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
