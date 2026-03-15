import { supabaseServer } from "@/lib/supabase";
import type { CalendarEntry } from "@/lib/types";
import CalendarGrid from "@/components/CalendarGrid";

export default async function CalendarPage() {
  const { data: entries } = await supabaseServer
    .from("content_calendar")
    .select("*")
    .order("scheduled_for", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Content Calendar</h1>
      <CalendarGrid entries={(entries as CalendarEntry[]) ?? []} />
    </div>
  );
}
