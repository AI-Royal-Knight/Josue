import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import UserAccountNav from "@/components/shared/user-nav-popup"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-[#0b1328]/90 px-4 backdrop-blur border-b">
          <SidebarTrigger className="-ml-1" />
          <DashboardBreadcrumb />
          {/* <div className="ml-auto flex items-center gap-4">
            <UserAccountNav />
          </div> */}
        </header>
        <div className="overflow-x-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
