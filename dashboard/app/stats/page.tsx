import StatsView from "@/components/StatsView";

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
      <StatsView />
    </div>
  );
}
