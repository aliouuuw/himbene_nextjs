'use client';

import { useState } from 'react';
import { User, UserRole } from '@prisma/client';
import { updateUser, deleteUser } from '@/app/actions/admin-actions';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function UserList({ users }: { users: User[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleUpdate = async (userId: string, data: {
    role: UserRole;
    name: string;
  }) => {
    try {
      await updateUser(userId, data);
      setEditingUser(null);
      toast.success('Utilisateur mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return;
    
    try {
      await deleteUser(userId);
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Role: {user.role}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                    >
                      Modifier
                    </Button>
                  </DialogTrigger>
                  {editingUser && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
                      </DialogHeader>
                      <EditUserForm
                        user={editingUser}
                        onSubmit={(data) => handleUpdate(user.id, data)}
                      />
                    </DialogContent>
                  )}
                </Dialog>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EditUserForm({ user, onSubmit }: {
  user: User;
  onSubmit: (data: {
    role: UserRole;
    name: string;
  }) => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [name, setName] = useState(user.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      role,
      name,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            <SelectItem value="INFOGRAPHE">Infographe</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <Button type="submit">Enregistrer les modifications</Button>
    </form>
  );
}