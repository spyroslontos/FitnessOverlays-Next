import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SessionInfo } from "@/components/session-info"
import { AthleteInfo } from "@/components/athlete-info"
import { SelectedActivityDisplay } from "@/components/selected-activity-display"
import { cookies } from "next/headers"


export default async function Page() {
  await SessionInfo()
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"
  
  return (
    <div className="h-screen [--header-height:calc(--spacing(14))]">
      <SidebarProvider defaultOpen={defaultOpen} className="flex flex-col h-full">
        <AppHeader />
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-2 sm:gap-4 p-2 sm:p-4 min-h-0">
              <div className="flex justify-center flex-1 min-h-0">
                <div className="w-full max-w-md h-full">
                  <SelectedActivityDisplay />
                </div>
              </div>
              <div className="flex-shrink-0 hidden sm:block">
                <AthleteInfo />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
