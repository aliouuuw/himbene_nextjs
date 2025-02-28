"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MonitorCog,
  PenTool,
  Share2,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  PlusCircle,
  Globe,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
  roles?: UserRole[];
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard/admin/",
    label: "Admin",
    icon: MonitorCog,
    roles: ["ADMIN"],
    children: [
      {
        href: "/dashboard/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/admin/users",
        label: "Users",
        icon: User,
      },
      {
        href: "/dashboard/admin/posts",
        label: "Posts",
        icon: PenTool,
      },
      {
        href: "/dashboard/admin/platforms",
        label: "Platforms",
        icon: Globe,
      },
    ],    
  },
  {
    href: "#",
    label: "Infographe",
    icon: PenTool,
    children: [
      {
        href: "/dashboard/infographe",
        label: "Tableau de bord",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/infographe/create",
        label: "Créer un post",
        icon: PlusCircle,
      },
    ],
    roles: ["ADMIN", "INFOGRAPHE"],
  },
  {
    href: "#",
    label: "Commercial",
    icon: Share2,
    children: [
      {
        href: "/dashboard/commercial",
        label: "Tableau de bord",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/commercial/publish",
        label: "Publier un post",
        icon: Globe,
      },
    ],
    roles: ["ADMIN", "COMMERCIAL"],
  },
];

export const cannotAccess = (
  userRole: UserRole | null,
  requiredRoles?: UserRole[]
) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const userHasAccess = userRole && requiredRoles.includes(userRole);
  return !userHasAccess;
};

export function SidebarNav({ userRole }: { userRole: UserRole | null }) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  useEffect(() => {
    console.log("userRole", userRole);
    const shouldNotAccess_ADMIN = cannotAccess(userRole, ["ADMIN"]);
    const shouldNotAccess_COMMERCIAL = cannotAccess(userRole, ["COMMERCIAL"]);
    console.log("User should not access ADMIN", shouldNotAccess_ADMIN);
    console.log(
      "User should not access COMMERCIAL",
      shouldNotAccess_COMMERCIAL
    );
  }, [userRole]);

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const isDropdown = !!item.children?.length;
    const isOpen = openDropdowns.includes(item.label);
    const isActive =
      pathname === item.href ||
      (isDropdown && item.children?.some((child) => pathname === child.href));

    if (isDropdown) {
      return (
        <div key={item.label} className="space-y-1">
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className="w-full justify-between"
            disabled={cannotAccess(userRole, item.roles ?? [])}
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
            <div className="pl-6 space-y-1">
              {item.children?.map((child) => (
                <Button
                  key={child.href}
                  asChild
                  variant={pathname === child.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  disabled={cannotAccess(userRole, item.roles ?? [])}
                >
                  <Link href={child.href}>
                    <child.icon className="mr-2 h-4 w-4" />
                    {child.label}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Button
        key={item.href}
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start"
        disabled={cannotAccess(userRole, item.roles)}
      >
        <Link
          href={item.href}
        onClick={(e) => {
          if (cannotAccess(userRole, item.roles)) {
            e.preventDefault();
          }
        }}
        className={`${cannotAccess(userRole, item.roles) ? 'pointer-events-none opacity-50' : ''} ${isActive ? 'bg-muted' : ''}`}
      >
        <item.icon className="mr-2 h-4 w-4" />
        {item.label}
      </Link>
    </Button>
    );
  };

  return (
    <nav className="flex flex-col gap-2 p-4">{navItems.map(renderNavItem)}</nav>
  );
}
