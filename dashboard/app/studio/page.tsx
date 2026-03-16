import { Suspense } from "react";
import ContentStudio from "@/components/ContentStudio";

type SearchParams = Promise<{
  topic?: string;
  brand?: string;
  format?: string;
}>;

export default async function StudioPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Content Studio</h1>
      <Suspense fallback={null}>
        <ContentStudio
          key={`${params.brand}-${params.topic}-${params.format}`}
          initialTopic={params.topic || ""}
          initialBrand={params.brand || "picasyfijas"}
          initialFormat={params.format || "standalone_post"}
        />
      </Suspense>
    </div>
  );
}
