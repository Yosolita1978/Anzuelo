import BrandsView from "@/components/BrandsView";

export default function BrandsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
      <BrandsView />
    </div>
  );
}
