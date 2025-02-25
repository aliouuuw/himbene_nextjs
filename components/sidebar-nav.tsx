"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Calendar, Settings } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/schedule", label: "Schedule", icon: Calendar },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={pathname === item.href ? "secondary" : "ghost"}
          className="justify-start"
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

