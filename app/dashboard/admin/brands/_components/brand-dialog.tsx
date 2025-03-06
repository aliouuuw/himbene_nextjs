"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createBrand, updateBrand } from "@/app/actions/admin-actions";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { X } from "lucide-react";

interface BrandDialogProps {
  mode: "add" | "edit";
  brand?: {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    isActive: boolean;
  };
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function BrandDialog({ mode, brand, onSuccess, trigger }: BrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(brand?.name || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl || "");
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const { startUpload } = useUploadThing("brandLogo");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLogoFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const removeLogo = () => {
    setLogoFile(null);
    if (mode === "edit" && logoUrl) {
      setLogoUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalLogoUrl = logoUrl;
      
      // Upload new logo if selected
      if (logoFile) {
        console.log("Uploading logo file:", logoFile.name);
        const uploadResponse = await startUpload([logoFile]);
        console.log("Upload response:", uploadResponse);
        if (uploadResponse && uploadResponse.length > 0) {
          finalLogoUrl = uploadResponse[0].url;
          console.log("New logo URL:", finalLogoUrl);
        }
      }

      console.log("Submitting brand with logo URL:", finalLogoUrl);
      const result = mode === "add" 
        ? await createBrand({ name, description, logoUrl: finalLogoUrl, isActive })
        : await updateBrand(brand!.id, { name, description, logoUrl: finalLogoUrl, isActive });

      console.log("Brand save result:", result);

      if (result.success) {
        toast.success(`Marque ${mode === "add" ? "créée" : "modifiée"} avec succès`);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error("Erreur lors de l'enregistrement de la marque");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant={mode === "edit" ? "ghost" : "default"}>
          {mode === "add" ? "Ajouter une marque" : "Modifier"}
        </Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Ajouter une marque" : "Modifier la marque"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom de la marque"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Entrez la description de la marque"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Logo</Label>
            {(logoUrl && !logoFile) ? (
              <div className="relative w-40 h-40 mx-auto">
                <Image 
                  src={logoUrl} 
                  alt={name} 
                  fill 
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : logoFile ? (
              <div className="relative w-40 h-40 mx-auto">
                <Image 
                  src={URL.createObjectURL(logoFile)} 
                  alt="Preview" 
                  fill 
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 cursor-pointer h-40 flex items-center justify-center ${
                  isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-center text-sm text-gray-600">
                  Glissez-déposez le logo ici, ou cliquez pour sélectionner un fichier
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Actif</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 