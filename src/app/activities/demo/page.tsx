import { Suspense } from "react";
import { promises as fs } from "fs";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityDetailCard } from "@/components/activity-detail-card";

export default async function DemoActivityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto p-4">
        <a href="/activities" className="text-sm text-blue-600 hover:underline">
          ← Back to Activities
        </a>
        <div className="mt-2 text-xs text-gray-500">
          This is demo data. No login required.
        </div>
        <Suspense fallback={<ActivityDetailSkeleton />}>
          <DemoActivityContent />
        </Suspense>
      </main>
    </div>
  );
}

async function DemoActivityContent() {
  const filePath = "public/demo/activity_demo.json";
  let detail: any;
  try {
    const json = await fs.readFile(filePath, "utf8");
    detail = JSON.parse(json);
  } catch (err) {
    return (
      <div className="mt-6">
        <div className="rounded-lg border bg-white p-6 text-center">
          <h2 className="mt-2 text-xl font-semibold">Demo data not found</h2>
          <p className="mt-1 text-sm text-gray-600">
            Ensure `public/demo/activity_demo.json` exists.
          </p>
        </div>
      </div>
    );
  }

  return <ActivityDetailCard detail={detail} />;
}

function ActivityDetailSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-2 h-7 w-2/3" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    </div>
  );
}
