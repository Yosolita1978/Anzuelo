import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    brand,
    platform,
    content,
    content_type,
    scheduled_for,
    source_lead_id,
    source_gap_id,
  } = body as {
    brand: string;
    platform: string;
    content: string;
    content_type?: string;
    scheduled_for?: string;
    source_lead_id?: string;
    source_gap_id?: string;
  };

  const { data, error } = await supabaseServer
    .from("content_calendar")
    .insert({
      brand,
      platform,
      content,
      content_type: content_type || null,
      scheduled_for: scheduled_for || null,
      source_lead_id: source_lead_id || null,
      source_gap_id: source_gap_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body as { id: string; status: string };

  if (!["posted", "skipped"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be 'posted' or 'skipped'" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("content_calendar")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
