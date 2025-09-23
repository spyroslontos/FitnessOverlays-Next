import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SessionInfo } from "@/components/session-info"
import { AthleteInfo } from "@/components/athlete-info"
import { ActivityViewer } from "@/components/activity-viewer"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default async function Page() {
  await SessionInfo()
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider defaultOpen={false} className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <ActivityViewer />
                </div>
              </div>
              <AthleteInfo />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
