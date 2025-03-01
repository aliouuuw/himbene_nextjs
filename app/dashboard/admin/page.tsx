import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, TrashIcon } from "lucide-react";
import { getBrands, createBrand, deleteBrand, updateBrand } from "@/app/actions/admin-actions";
import { revalidatePath } from "next/cache";
export default async function AdminPage() {
  const brands = await getBrands();

  async function handleCreateBrand(formData: FormData) {
    'use server';
    const name = formData.get('brandName') as string;
    if (!name) return;
    await createBrand(name);
    revalidatePath('/dashboard/admin');
  }

  async function handleDeleteBrand(brandId: string) {
    'use server';
    await deleteBrand(brandId);
    revalidatePath('/dashboard/admin');
  }

  async function handleUpdateBrand(brandId: string, formData: FormData) {
    'use server';
    const name = formData.get('brandName') as string;
    if (!name) return;
    await updateBrand(brandId, name);
    revalidatePath('/dashboard/admin');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Link 
          href="/dashboard/admin/users" 
          className="p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <h2 className="font-semibold mb-2">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </Link>
        <Link 
          href="/dashboard/admin/posts" 
          className="p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <h2 className="font-semibold mb-2">Posts</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage social media posts
          </p>
        </Link>
        <Link 
          href="/dashboard/admin/platforms" 
          className="p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <h2 className="font-semibold mb-2">Connected Platforms</h2>
          <p className="text-sm text-muted-foreground">
            Manage social media connections
          </p>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreateBrand} className="flex gap-2 mb-4">
            <Input
              type="text"
              name="brandName"
              placeholder="Brand Name"
              className="max-w-sm"
            />
            <Button type="submit">Add Brand</Button>
          </form>

          <div className="space-y-2">
            {brands.map((brand) => (
              <form
                key={brand.id}
                action={handleUpdateBrand.bind(null, brand.id)}
                className="flex items-center gap-2 group"
              >
                <Input
                  type="text"
                  name="brandName"
                  defaultValue={brand.name}
                  className="max-w-sm"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  formAction={handleDeleteBrand.bind(null, brand.id)}
                  variant="destructive"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
