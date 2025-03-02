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
import { Separator } from "@/components/ui/separator";

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
      title: "Utilisateurs",
      description: "Gérer les comptes utilisateurs et leurs permissions",
      icon: Users,
      href: "/dashboard/admin/users",
      count: `${userCount} ${userCount === 1 ? "Utilisateur" : "Utilisateurs"}`
    },
    {
      title: "Posts",
      description: "Surveiller tous les posts sur la plateforme",
      icon: PenTool,
      href: "/dashboard/admin/posts",
      count: `${postCount} ${postCount === 1 ? "Post" : "Posts"}`
    },
    {
      title: "Marques",
      description: "Gérer les marques et leurs détails",
      icon: Building2,
      href: "/dashboard/admin/brands",
      count: `${brandCount} ${brandCount === 1 ? "Marque" : "Marques"}`
    },
    {
      title: "Couleurs",
      description: "Gérer les couleurs des cheveux",
      icon: Palette,
      href: "/dashboard/admin/colors",
      count: `${colorCount} ${colorCount === 1 ? "Couleur" : "Couleurs"}`
    },
    {
      title: "Tailles",
      description: "Gérer les tailles des cheveux",
      icon: Ruler,
      href: "/dashboard/admin/sizes",
      count: `${sizeCount} ${sizeCount === 1 ? "Taille" : "Tailles"}`
    },
    {
      title: "Devises",
      description: "Gérer les devises et les taux de change",
      icon: Currency,
      href: "/dashboard/admin/currencies",
      count: `${currencyCount} ${currencyCount === 1 ? "Devise" : "Devises"}`
    },
    {
      title: "Plateformes",
      description: "Configurer les plateformes sociales",
      icon: Share2,
      href: "/dashboard/admin/platforms",
      count: `${platformCount} ${platformCount === 1 ? "Plateforme" : "Plateformes"}`,
      isDisabled: true
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm pt-3">
          Gérer tous les aspects de votre plateforme de publication sur les réseaux sociaux
        </p>
      </div>

      <Separator />

        <Table>
          <TableCaption>Liste de toutes les sections de gestion</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Section</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Statut</TableHead>
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
