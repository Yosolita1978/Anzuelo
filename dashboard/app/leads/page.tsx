import LeadsView from "@/components/LeadsView";

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
      <LeadsView />
    </div>
  );
}
