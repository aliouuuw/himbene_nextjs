import type React from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 overflow-y-auto border-r md:block">
        <SidebarNav />
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}

