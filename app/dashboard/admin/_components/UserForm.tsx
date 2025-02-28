/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { UserRole } from '@prisma/client';
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

export default function UserForm() {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const form = useForm({
    defaultValues: {
      email: '',
      role: 'COMMERCIAL' as UserRole,
      firstName: '',
      lastName: ''
    }
  });

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
        <CardTitle>Create New User</CardTitle>
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
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
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
                  <FormLabel>First Name</FormLabel>
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Create User</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 