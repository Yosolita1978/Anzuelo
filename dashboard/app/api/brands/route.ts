import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("brands")
    .select("*")
    .eq("active", true)
    .order("display_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseServer
    .from("brands")
    .insert({
      slug: body.slug,
      display_name: body.display_name,
      color_bg: body.color_bg || "#f5f5f4",
      color_fg: body.color_fg || "#78716c",
      description: body.description || null,
      scoring_prompt: body.scoring_prompt || null,
      website_url: body.website_url || null,
      plausible_link: body.plausible_link || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("brands")
    .update(updates)
    .eq("id", id)
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
    .from("brands")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
