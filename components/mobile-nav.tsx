"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cannotAccess, navItems } from "@/components/sidebar-nav" // Import the navItems from sidebar-nav
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserRole } from "@prisma/client"

export function MobileNav({ userRole }: { userRole: UserRole | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between p-4 border-b md:hidden">
      <Link href="/dashboard" className="font-semibold text-lg">
        Wig Shop
      </Link>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="font-semibold" onClick={() => setOpen(false)}>
                  Wig Shop
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <nav className="flex flex-col gap-2 p-4">
                {navItems.map((item) => {
                  // If it's a dropdown item
                  if (item.children) {
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="font-medium px-2 py-1.5 text-sm">
                          <div className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </div>
                        </div>
                        <div className="pl-4 space-y-1">
                          {item.children.map((child) => (
                            <Button
                              key={child.href}
                              asChild
                              variant={pathname === child.href ? "secondary" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => setOpen(false)}
                              disabled={cannotAccess(userRole, item.roles ?? [])}
                            >
                              <Link href={child.href}>
                                <child.icon className="mr-2 h-4 w-4" />
                                {child.label}
                              </Link>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  
                  // Regular item
                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </Button>
                  )
                })}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 