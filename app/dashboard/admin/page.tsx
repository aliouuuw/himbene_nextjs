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
  Building2,
  ArrowRight,
  Currency
} from "lucide-react";
import prismaClient from "@/lib/prisma-client"; // Add this import for database access

// This makes the component a Server Component that can fetch data
export default async function AdminPage() {
  // Fetch all the counts from the database
  const userCount = await prismaClient.user.count();
  const brandCount = await prismaClient.brand.count();
  const platformCount = await prismaClient.platformConnection.count();
  const postCount = await prismaClient.post.count();
  const colorCount = await prismaClient.wigColor.count();
  const sizeCount = await prismaClient.wigSize.count();
  const currencyCount = await prismaClient.currency.count();

  const managementSections = [
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: Users,
      href: "/dashboard/admin/users",
      count: `${userCount} ${userCount === 1 ? "User" : "Users"}`
    },
    {
      title: "Post Management",
      description: "Monitor all posts across the platform",
      icon: PenTool,
      href: "/dashboard/admin/posts",
      count: `${postCount} ${postCount === 1 ? "Post" : "Posts"}`
    },
    {
      title: "Brand Management",
      description: "Manage wig brands and their details",
      icon: Building2,
      href: "/dashboard/admin/brands",
      count: `${brandCount} ${brandCount === 1 ? "Brand" : "Brands"}`
    },
    {
      title: "Color Management",
      description: "Manage wig colors",
      icon: Palette,
      href: "/dashboard/admin/colors",
      count: `${colorCount} ${colorCount === 1 ? "Color" : "Colors"}`
    },
    {
      title: "Size Management",
      description: "Manage wig sizes",
      icon: Ruler,
      href: "/dashboard/admin/sizes",
      count: `${sizeCount} ${sizeCount === 1 ? "Size" : "Sizes"}`
    },
    {
      title: "Currency Management",
      description: "Manage currencies and exchange rates",
      icon: Currency,
      href: "/dashboard/admin/currencies",
      count: `${currencyCount} ${currencyCount === 1 ? "Currency" : "Currencies"}`
    },
    {
      title: "Platform Management",
      description: "Configure social media platforms",
      icon: Share2,
      href: "/dashboard/admin/platforms",
      count: `${platformCount} ${platformCount === 1 ? "Platform" : "Platforms"}`,
      isDisabled: true
    },
  ];

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
              <TableRow key={section.href} className={section.isDisabled ? "opacity-50 cursor-not-allowed" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </div>
                </TableCell>
                <TableCell>{section.description}</TableCell>
                <TableCell>{section.count}</TableCell>
                <TableCell>
                  <Button disabled={section.isDisabled} variant="ghost" size="sm" asChild>
                    <a href={section.href} className={section.isDisabled ? "pointer-events-none" : ""}>
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
