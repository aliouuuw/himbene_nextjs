'use client';

import { useState } from 'react';
import { User, Brand, UserRole } from '@prisma/client';
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
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

interface UserWithBrands extends User {
  brands: { brand: Brand }[];
}

interface UserListProps {
  users: UserWithBrands[];
  brands: Brand[];
}

export default function UserList({ users, brands }: UserListProps) {
  const [editingUser, setEditingUser] = useState<UserWithBrands | null>(null);

  const handleUpdate = async (userId: string, data: {
    role: UserRole;
    firstName: string;
    lastName: string;
    brandIds: string[];
  }) => {
    try {
      await updateUser(userId, data);
      setEditingUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
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
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Brands: {user.brands?.map(b => b.brand.name).join(', ') || 'None'}
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  {editingUser && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                      </DialogHeader>
                      <EditUserForm
                        user={editingUser}
                        brands={brands}
                        onSubmit={(data) => handleUpdate(user.id, data)}
                      />
                    </DialogContent>
                  )}
                </Dialog>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EditUserForm({ user, brands, onSubmit }: {
  user: UserWithBrands;
  brands: Brand[];
  onSubmit: (data: {
    role: UserRole;
    firstName: string;
    lastName: string;
    brandIds: string[];
  }) => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [selectedBrands, setSelectedBrands] = useState(
    user.brands?.map(b => b.brand.id) || []
  );

  // Transform brands into the format expected by MultiSelect
  const brandOptions = brands.map(brand => ({
    label: brand.name,
    value: brand.id
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      role,
      firstName,
      lastName,
      brandIds: selectedBrands,
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
        <label className="block text-sm font-medium mb-1">First Name</label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Last Name</label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Brands</label>
        <MultiSelect
          options={brandOptions}
          onValueChange={setSelectedBrands}
          defaultValue={selectedBrands}
          placeholder="Select brands"
        />
      </div>

      <Button type="submit">Save Changes</Button>
    </form>
  );
}