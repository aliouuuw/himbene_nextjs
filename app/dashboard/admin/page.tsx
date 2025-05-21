import { 
  Users, 
  PenTool, 
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import prismaClient from "@/lib/prisma-client";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManagementTable } from "./_components/ManagementTable";
import { CurrencyCode } from "@/lib/currency-utils";
import { getCurrencyFlag } from "@/lib/currency-utils";
import Image from "next/image";
interface ManagementSection {
  title: string;
  description: string;
  iconName: string;
  href: string;
  count: string;
}

// This makes the component a Server Component that can fetch data
export default async function AdminPage() {
  // Fetch all the counts from the database related to the admin dashboard
  const userCount = await prismaClient.user.count({
    where: {
      role: "ADMIN"
    }
  });
  const platformCount = await prismaClient.platformConnection.count();
  const postCount = await prismaClient.post.count();
  const colorCount = await prismaClient.wigColor.count();
  const sizeCount = await prismaClient.wigSize.count();
  const qualityCount = await prismaClient.wigQuality.count();

  // Fetch additional statistics
  const newUsersToday = await prismaClient.user.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });

  const postsThisWeek = await prismaClient.post.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  });

  // Currency-related queries
  const activeCurrencies = await prismaClient.currency.count();

  const latestRateUpdates = await prismaClient.currency.findMany({
    orderBy: { lastUpdated: 'desc' },
    take: 5,
    select: {
      id: true,
      rate: true,
      lastUpdated: true,
      symbol: true
    }
  });

  // Find most used currency through wigs
  const mostUsedCurrency = await prismaClient.wig.groupBy({
    by: ['currencyId'],
    _count: {
      currencyId: true
    },
    orderBy: {
      _count: {
        currencyId: 'desc'
      }
    },
    take: 1
  });

  // Default value if no results
  const mostUsedCurrencyId = mostUsedCurrency.length > 0 ? mostUsedCurrency[0].currencyId : 'N/A';
  const mostUsedCurrencyCount = mostUsedCurrency.length > 0 ? mostUsedCurrency[0]._count.currencyId : 0;

  const managementSections = [
    {
      title: "Utilisateurs",
      description: "Gérer les comptes utilisateurs et leurs permissions",
      iconName: "users",
      href: "/dashboard/admin/users",
      count: `${userCount} ${userCount === 1 ? "Utilisateur" : "Utilisateurs"}`
    },
    {
      title: "Posts",
      description: "Surveiller tous les posts sur la plateforme",
      iconName: "pen-tool",
      href: "/dashboard/admin/posts",
      count: `${postCount} ${postCount === 1 ? "Post" : "Posts"}`
    },
    {
      title: "Couleurs",
      description: "Gérer les couleurs des cheveux",
      iconName: "palette",
      href: "/dashboard/admin/colors",
      count: `${colorCount} ${colorCount === 1 ? "Couleur" : "Couleurs"}`
    },
    {
      title: "Tailles",
      description: "Gérer les tailles des cheveux",
      iconName: "ruler",
      href: "/dashboard/admin/sizes",
      count: `${sizeCount} ${sizeCount === 1 ? "Taille" : "Tailles"}`
    },
    {
      title: "Devises",
      description: "Gérer les devises et les taux de change",
      iconName: "dollar-sign",
      href: "/dashboard/admin/currencies",
      count: `${activeCurrencies} ${activeCurrencies === 1 ? "Devise" : "Devises"}`
    },
    {
      title: "Qualités",
      description: "Gérer les qualités des cheveux",
      iconName: "award",
      href: "/dashboard/admin/qualities",
      count: `${qualityCount} ${qualityCount === 1 ? "Qualité" : "Qualités"}`
    },
    {
      title: "Plateformes",
      description: "Configurer les plateformes sociales",
      iconName: "share-2",
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
          Vue d&apos;ensemble et gestion de votre plateforme
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              +{newUsersToday} aujourd&apos;hui
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Cette Semaine</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postsThisWeek}</div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              +{Math.round((postsThisWeek / (postCount || 1)) * 100)}% vs. moyenne
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devises Actives</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCurrencies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devise la Plus Utilisée</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostUsedCurrencyId}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostUsedCurrencyCount} wigs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Currency Rate Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dernières Mises à Jour des Taux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {latestRateUpdates.length > 0 ? (
              latestRateUpdates.map((currency) => (
                <div 
                  key={currency.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                  <div>
                    <Image src={getCurrencyFlag(currency.id as CurrencyCode)} alt={currency.id} width={20} height={20} />
                  </div>
                    <span>{currency.symbol}</span>
                    <span className="font-medium">{currency.id}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{currency.rate.toFixed(4)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(currency.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Aucune mise à jour récente</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <ManagementTable sections={managementSections as ManagementSection[]} />
    </div>
  );
}
