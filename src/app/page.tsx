"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { LoginWithStravaButton } from "@/components/login-with-strava-button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  const handleLogin = async () => {};

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Fitness Overlays
          </h2>

          {session?.user ? (
            <div className="text-center space-y-4">
              <p className="text-lg mb-4 text-gray-600">
                Welcome,{" "}
                <span className="font-semibold">{session.user.name}</span>!
              </p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button asChild className="w-full">
                    <a href="/activities">Go to Activities</a>
                  </Button>
                </div>
                <div>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/activities/demo">Try Demo</a>
                  </Button>
                </div>
              </div>

              <Carousel className="mt-6">
                <CarouselContent>
                  <CarouselItem>
                    <div className="rounded-lg border p-4 text-left">
                      <div className="text-sm text-gray-600">
                        Overlay Builder
                      </div>
                      <div className="mt-2 font-medium">
                        Create dynamic overlays for your activities
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="rounded-lg border p-4 text-left">
                      <div className="text-sm text-gray-600">
                        Automatic Sync
                      </div>
                      <div className="mt-2 font-medium">
                        Strava data syncs automatically with cooldown
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="rounded-lg border p-4 text-left">
                      <div className="text-sm text-gray-600">Mobile First</div>
                      <div className="mt-2 font-medium">
                        Optimized for phones and desktops
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg mb-6 text-gray-600">
                Connect with Strava to get started
              </p>
              <div className="space-y-3">
                <div className="w-full flex justify-center">
                  <LoginWithStravaButton />
                </div>
                <div>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/activities/demo">Try Demo</a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
