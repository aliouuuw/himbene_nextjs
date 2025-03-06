/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { UserRole, Brand } from '@prisma/client';
import { createUser } from '@/app/actions/admin-actions';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

interface UserFormProps {
  brands: Brand[];
}

export default function UserForm({ brands }: UserFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('COMMERCIAL');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await createUser({
        email: email,
        name: name,
        role: role,
        brandIds: selectedBrands
      });
      
      if (result.success) {
        toast.success('Utilisateur créé avec succès');
        // Store the temporary password to display to admin
        setTempPassword(result.tempPassword || null);
        // Reset form
        setEmail('');
        setName('');
        setRole('COMMERCIAL');
        setSelectedBrands([]);
      } else {
        toast.error(result.error || 'Erreur lors de la création de l\'utilisateur');
      }
    } catch (error) {
      toast.error('Erreur lors de la création de l\'utilisateur');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPasswordToClipboard = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      toast.success('Mot de passe copié dans le presse-papier');
    }
  };

  const brandOptions = brands.map(brand => ({
    value: brand.id,
    label: brand.name
  }));

  return (
    <div className="space-y-4">
      {tempPassword && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Utilisateur créé avec succès</AlertTitle>
          <AlertDescription className="text-green-700">
            <div className="mt-2">
              <p>Mot de passe temporaire:</p>
              <div className="flex items-center mt-1 bg-white p-2 rounded border">
                <code className="font-mono text-sm mr-2">{tempPassword}</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyPasswordToClipboard}
                  className="ml-auto"
                >
                  <Copy size={16} />
                </Button>
              </div>
              <p className="text-sm mt-2">
                Partagez ce mot de passe avec l&apos;utilisateur. Il devra le changer lors de sa première connexion.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select 
                value={role} 
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="INFOGRAPHE">Infographe</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brands">Marques</Label>
              <MultiSelect
                options={brandOptions}
                selected={selectedBrands}
                onChange={setSelectedBrands}
                placeholder="Sélectionner des marques"
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création en cours...' : 'Créer utilisateur'}
          </Button>
        </form>
      </Card>
    </div>
  );
} 