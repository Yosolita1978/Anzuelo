import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");

  if (!brand) {
    return NextResponse.json({ error: "brand is required" }, { status: 400 });
  }

  const [leadsResult, gapsResult, calendarResult] = await Promise.all([
    supabaseServer
      .from("leads")
      .select("id, platform, score, status, found_at")
      .eq("brand", brand),
    supabaseServer
      .from("content_opportunities")
      .select("id, status, found_at")
      .eq("brand", brand),
    supabaseServer
      .from("content_calendar")
      .select("id, status, created_at")
      .eq("brand", brand),
  ]);

  if (leadsResult.error) {
    return NextResponse.json({ error: leadsResult.error.message }, { status: 500 });
  }

  const leads = leadsResult.data ?? [];
  const gaps = gapsResult.data ?? [];
  const calendar = calendarResult.data ?? [];

  // Summary
  const total = leads.length;
  const replied = leads.filter((l) => l.status === "replied").length;
  const skipped = leads.filter((l) => l.status === "skipped").length;
  const newCount = leads.filter((l) => l.status === "new").length;
  const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0;

  // By platform
  const byPlatform: Record<string, number> = {};
  for (const lead of leads) {
    byPlatform[lead.platform] = (byPlatform[lead.platform] || 0) + 1;
  }

  // Score distribution
  const byScore: Record<number, number> = {};
  for (const lead of leads) {
    byScore[lead.score] = (byScore[lead.score] || 0) + 1;
  }

  // Daily counts (last 14 days)
  const dailyCounts: Record<string, number> = {};
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyCounts[d.toISOString().slice(0, 10)] = 0;
  }
  for (const lead of leads) {
    const day = lead.found_at.slice(0, 10);
    if (day in dailyCounts) {
      dailyCounts[day]++;
    }
  }

  // Gaps summary
  const gapsTotal = gaps.length;
  const gapsDone = gaps.filter((g) => g.status === "done").length;

  // Calendar summary
  const calendarTotal = calendar.length;
  const calendarPosted = calendar.filter((c) => c.status === "posted").length;

  return NextResponse.json({
    summary: { total, replied, skipped, new: newCount, replyRate },
    byPlatform,
    byScore,
    dailyCounts,
    gaps: { total: gapsTotal, done: gapsDone },
    calendar: { total: calendarTotal, posted: calendarPosted },
  });
}
