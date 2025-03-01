"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, ChevronDown, ChevronRight } from "lucide-react"
import { cannotAccess, navItems } from "@/components/sidebar-nav" // Import the navItems from sidebar-nav
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { UserRole } from "@prisma/client"

export function MobileNav({ userRole }: { userRole: UserRole | null }) {
  const [open, setOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])
  const pathname = usePathname()

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    )
  }

  return (
    <div className="flex items-center justify-between p-4 border-b md:hidden">
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
                <SheetTitle>Menu</SheetTitle>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <nav className="flex flex-col gap-2 p-4">
                {navItems.map((item) => {
                  const isDropdown = !!item.children?.length;
                  const isOpen = openDropdowns.includes(item.label);
                  const isActive = pathname === item.href ||
                    (isDropdown && item.children?.some((child) => pathname === child.href));
                  const isDisabled = cannotAccess(userRole, item.roles ?? []);

                  if (isDropdown) {
                    return (
                      <div key={item.label} className="space-y-1">
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-between"
                          disabled={isDisabled}
                          onClick={() => toggleDropdown(item.label)}
                        >
                          <div className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </div>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>

                        {isOpen && (
                          <div className="pl-4 space-y-1">
                            {item.children?.map((child) => (
                              <Button
                                key={child.href}
                                asChild
                                variant={pathname === child.href ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                disabled={isDisabled}
                              >
                                <Link href={child.href} onClick={() => setOpen(false)}>
                                  <child.icon className="mr-2 h-4 w-4" />
                                  {child.label}
                                </Link>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      disabled={isDisabled}
                    >
                      <Link 
                        href={item.href}
                        onClick={(e) => {
                          if (isDisabled) {
                            e.preventDefault();
                          } else {
                            setOpen(false);
                          }
                        }}
                        className={`${isDisabled ? 'pointer-events-none opacity-50' : ''} ${isActive ? 'bg-muted' : ''}`}
                      >
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