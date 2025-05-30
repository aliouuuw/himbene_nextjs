import { getAuthenticatedUserRole } from "../actions/user-actions"
import { MobileNav } from "@/components/mobile-nav"
import { SidebarNav } from "@/components/sidebar-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userRole = await getAuthenticatedUserRole()
  
  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden w-64 overflow-y-auto border-r md:block">
        <SidebarNav userRole={userRole} />
      </aside>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile navigation - only visible on mobile */}
        <MobileNav userRole={userRole} />
        
        {/* Content area with padding that adjusts for mobile */}
        <main className="flex-1 overflow-y-auto p-4 md:py-4 md:px-8">{children}</main>
      </div>
    </div>
  );
}

