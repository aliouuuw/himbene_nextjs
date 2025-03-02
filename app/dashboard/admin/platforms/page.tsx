import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const platforms = [
  {
    id: "facebook",
    name: "Facebook",
    isEnabled: true,
    icon: "/icons/facebook.png"
  },
  {
    id: "twitter",
    name: "Twitter",
    isEnabled: true,
    icon: "/icons/twitter.png"
  },
  {
    id: "instagram",
    name: "Instagram",
    isEnabled: false,
    icon: "/icons/instagram.png"
  },
  {
    id: "pinterest",
    name: "Pinterest",
    isEnabled: true,
    icon: "/icons/pinterest.png"
  }
];

export default function PlatformsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des plateformes</h1>
      </div>

      <Table>
        <TableCaption>Configurer les plateformes sociales</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Plateforme</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Activé</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {platforms.map((platform) => (
            <TableRow key={platform.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {platform.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={platform.isEnabled ? "default" : "secondary"}>
                  {platform.isEnabled ? "Activé" : "Désactivé"}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch checked={platform.isEnabled} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Configurer</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 