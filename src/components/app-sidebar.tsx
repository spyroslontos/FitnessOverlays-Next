"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ActivityTile } from "./activity-tile";

export function AppSidebar() {
  const { isPending, error, data } = useQuery({
    queryKey: ["activityData"],
    queryFn: () => fetch("/api/activities").then((res) => res.json()),
    staleTime: 0, // Always refetch when component mounts
  });

  const activities = Array.isArray(data) ? data : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <h3 className="font-bold text-lg">Activities ({activities.length})</h3>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isPending ? (
                <div className="space-y-3 p-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 text-sm text-destructive">
                  Error loading activities
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {activities.map((activity: any) => (
                    <SidebarMenuItem key={activity.id} className="p-0">
                      <ActivityTile
                        activity={activity}
                        onClick={(id) => {
                          window.dispatchEvent(
                            new CustomEvent("activitySelected", { detail: id })
                          );
                        }}
                      />
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
