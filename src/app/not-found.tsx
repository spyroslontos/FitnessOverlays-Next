import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto p-4">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl sm:text-7xl font-extrabold tracking-tight">
              404
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold">
              Off The Beaten Track!
            </h1>
            <p className="mt-2 text-gray-600 max-w-xl mx-auto">
              Looks like this page went for a run and got lost. Let's get back
              on track!
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button asChild>
                <a href="/">Go Home</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
