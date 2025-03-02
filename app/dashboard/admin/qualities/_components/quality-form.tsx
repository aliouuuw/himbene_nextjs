"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createWigQuality } from "@/app/actions/admin-actions";
import { toast } from "sonner";

export function QualityForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createWigQuality(name, description);
      
      if (result.success) {
        toast.success("Qualité créée avec succès");
        setName("");
        setDescription("");
      } else {
        toast.error(result.error || "Échec de la création de la qualité");
      }
    } catch (error) {
      console.error("Error creating quality:", error);
      toast.error("Une erreur s'est produite lors de la création de la qualité");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter une qualité</CardTitle>
        <CardDescription>
          Créer une nouvelle qualité de perruque
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Premium, Standard, etc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la qualité..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading || !name}>
            {loading ? "Création..." : "Créer la qualité"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 