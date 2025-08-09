import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto p-4">
        <a href="/activities" className="text-sm text-blue-600 hover:underline">
          ← Back to Activities
        </a>
        <div className="mt-6">
          <div className="rounded-lg border bg-white p-6 text-center">
            <div className="text-2xl">🏃‍♂️💨</div>
            <h2 className="mt-2 text-xl font-semibold">
              We couldn’t find that activity
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              It may not exist, or you don’t have access to view it.
            </p>
            <div className="mt-4">
              <a
                href="/activities"
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to Activities
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
