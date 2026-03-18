import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandSlug = searchParams.get("brand_slug");

  if (!brandSlug) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabaseServer
    .from("brand_searches")
    .select("*")
    .eq("brand_slug", brandSlug)
    .eq("active", true)
    .order("platform", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseServer
    .from("brand_searches")
    .upsert(
      {
        brand_slug: body.brand_slug,
        platform: body.platform,
        config_key: body.config_key,
        terms: body.terms,
      },
      { onConflict: "brand_slug,platform" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("brand_searches")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
