"use client";

import { useState } from "react";
import { WigQuality } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { updateWigQuality, deleteWigQuality } from "@/app/actions/admin-actions";
import { toast } from "sonner";

interface QualityTableProps {
  qualities: WigQuality[];
}

export function QualityTable({ qualities }: QualityTableProps) {
  const [editingQuality, setEditingQuality] = useState<WigQuality | null>(null);
  const [deletingQualityId, setDeletingQualityId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEdit = (quality: WigQuality) => {
    setEditingQuality(quality);
    setName(quality.name);
    setDescription(quality.description || "");
  };

  const handleUpdate = async () => {
    if (!editingQuality) return;
    
    setLoading(true);
    try {
      const result = await updateWigQuality(editingQuality.id, name, description);
      
      if (result.success) {
        toast.success("Qualité mise à jour avec succès");
        setEditingQuality(null);
      } else {
        toast.error(result.error || "Échec de la mise à jour de la qualité");
      }
    } catch (error) {
      console.error("Error updating quality:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour de la qualité");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingQualityId) return;
    
    setLoading(true);
    try {
      const result = await deleteWigQuality(deletingQualityId);
      
      if (result.success) {
        toast.success("Qualité supprimée avec succès");
        setDeletingQualityId(null);
      } else {
        toast.error(result.error || "Échec de la suppression de la qualité");
      }
    } catch (error) {
      console.error("Error deleting quality:", error);
      toast.error("Une erreur s'est produite lors de la suppression de la qualité");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Qualités existantes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {qualities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Aucune qualité trouvée
              </TableCell>
            </TableRow>
          ) : (
            qualities.map((quality) => (
              <TableRow key={quality.id}>
                <TableCell className="font-medium">{quality.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {quality.description || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(quality)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier la qualité</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nom</Label>
                            <Input
                              id="edit-name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                          </DialogClose>
                          <Button
                            onClick={handleUpdate}
                            disabled={loading || !name}
                          >
                            {loading ? "Mise à jour..." : "Mettre à jour"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingQualityId(quality.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Êtes-vous sûr de vouloir supprimer cette qualité?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Cela supprimera définitivement la qualité &quot;{quality.name}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingQualityId(null)}>
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {loading ? "Suppression..." : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 