import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Share2, 
  PenTool, 
  Palette, 
  Ruler, 
  DollarSign,
  Building2,
  ArrowRight
} from "lucide-react";

const managementSections = [
  {
    title: "User Management",
    description: "Manage user accounts and permissions",
    icon: Users,
    href: "/dashboard/admin/users",
    count: "23 Users" // You can make these dynamic later
  },
  {
    title: "Brand Management",
    description: "Manage wig brands and their details",
    icon: Building2,
    href: "/dashboard/admin/brands",
    count: "8 Brands"
  },
  {
    title: "Platform Management",
    description: "Configure social media platforms",
    icon: Share2,
    href: "/dashboard/admin/platforms",
    count: "4 Platforms"
  },
  {
    title: "Post Overview",
    description: "Monitor all posts across the platform",
    icon: PenTool,
    href: "/dashboard/admin/posts",
    count: "156 Posts"
  },
  {
    title: "Color Management",
    description: "Manage wig colors",
    icon: Palette,
    href: "/dashboard/admin/colors",
    count: "12 Colors"
  },
  {
    title: "Size Management",
    description: "Manage wig sizes",
    icon: Ruler,
    href: "/dashboard/admin/sizes",
    count: "5 Sizes"
  },
  {
    title: "Currency Management",
    description: "Manage currencies and exchange rates",
    icon: DollarSign,
    href: "/dashboard/admin/currencies",
    count: "3 Currencies"
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage all aspects of your social media posting platform
        </p>
      </div>
        <Table>
          <TableCaption>A list of all management sections</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Section</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managementSections.map((section) => (
              <TableRow key={section.href}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </div>
                </TableCell>
                <TableCell>{section.description}</TableCell>
                <TableCell>{section.count}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={section.href}>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
