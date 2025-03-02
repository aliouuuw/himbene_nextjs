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
  Globe,
  User,
  Palette,
  Ruler,
  Building2,
  Currency,
} from "lucide-react";
import { useState } from "react";
import { UserRole } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
  roles?: UserRole[];
  isDisabled?: boolean;
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
        label: "Tableau de bord",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/admin/users",
        label: "Utilisateurs",
        icon: User,
      },
      {
        href: "/dashboard/admin/posts",
        label: "Posts",
        icon: PenTool,
      },
      {
        href: "/dashboard/admin/brands",
        label: "Marques",
        icon: Building2,
      },
      {
        href: "/dashboard/admin/sizes",
        label: "Tailles",
        icon: Ruler,
      },
      {
        href: "/dashboard/admin/colors",
        label: "Couleurs",
        icon: Palette,
      },
      {
        href: "/dashboard/admin/currencies",
        label: "Devises",
        icon: Currency,
      },
      {
        href: "/dashboard/admin/platforms",
        label: "Plateformes",
        icon: Globe,
        isDisabled: true,
      },
    ],    
  },
  {
    href: "#",
    label: "Infographe",
    icon: PenTool,
    children: [
      {
        href: "/dashboard/infographe/home",
        label: "Tableau de bord",
        icon: LayoutDashboard,
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
        href: "/dashboard/commercial/home",
        label: "Tableau de bord",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/commercial/platforms",
        label: "Plateformes",
        icon: Globe,
        isDisabled: true,
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
                  disabled={cannotAccess(userRole, item.roles ?? []) || child.isDisabled}
                >
                  <Link href={child.href} className={child.isDisabled ? "pointer-events-none" : ""}>
                    <child.icon className={`mr-2 h-4 w-4 ${child.isDisabled ? "opacity-50" : ""}`} />
                    <p className={child.isDisabled ? "opacity-50" : ""}>{child.label}</p>
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
        disabled={cannotAccess(userRole, item.roles) || item.isDisabled}
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
