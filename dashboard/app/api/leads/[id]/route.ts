import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const status = body.status as string;

  if (!["replied", "skipped"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be 'replied' or 'skipped'" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
