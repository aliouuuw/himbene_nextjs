/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { UserRole, Brand } from '@prisma/client';
import { createUser } from '@/app/actions/admin-actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";

interface UserFormProps {
  brands: Brand[];
}

export default function UserForm({ brands }: UserFormProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const form = useForm({
    defaultValues: {
      email: '',
      role: 'COMMERCIAL' as UserRole,
      firstName: '',
      lastName: '',
      brandIds: [] as string[]
    }
  });

  // Transform brands into the format expected by MultiSelect
  const brandOptions = brands.map(brand => ({
    label: brand.name,
    value: brand.id
  }));

  const onSubmit = async (data: any) => {
    try {
      const result = await createUser(data);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'User created successfully' });
        form.reset();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create user' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to create user: ' + error });
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Créer un nouvel utilisateur</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-4 ${
            message.type === 'success' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'
          }`}>
            <AlertDescription className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="INFOGRAPHE">Infographe</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>  
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marques</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={brandOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionner le(s) marque(s)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Créer l&apos;utilisateur</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 