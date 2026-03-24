import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const status = body.status as string;
  const ignoreAuthor = body.ignore_author as boolean | undefined;

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

  // Mark post as seen so the agent never re-scrapes it
  if (data.post_id) {
    await supabaseServer
      .from("seen_posts")
      .upsert({ post_id: data.post_id }, { onConflict: "post_id" });
  }

  if (ignoreAuthor && data.author) {
    await supabaseServer
      .from("ignored_authors")
      .upsert(
        {
          brand: data.brand,
          author: data.author,
          platform: data.platform,
          reason: `Skipped lead ${id}`,
        },
        { onConflict: "brand,author" }
      );
  }

  return NextResponse.json(data);
}
