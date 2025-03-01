import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, TrashIcon } from "lucide-react";
import { 
  getBrands, createBrand, deleteBrand, updateBrand,
  getWigColors, createWigColor, deleteWigColor, updateWigColor,
  getWigSizes, createWigSize, deleteWigSize, updateWigSize,
  getCurrencies, createCurrency, deleteCurrency, updateCurrency,
} from "@/app/actions/admin-actions";
import { revalidatePath } from "next/cache";

export default async function AdminPage() {
  const [brands, colors, sizes, currencies] = await Promise.all([
    getBrands(),
    getWigColors(),
    getWigSizes(),
    getCurrencies(),
  ]);

  // Brand Actions
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

  // Color Actions
  async function handleCreateColor(formData: FormData) {
    'use server';
    const name = formData.get('colorName') as string;
    const hexCode = formData.get('hexCode') as string;
    if (!name) return;
    await createWigColor(name, hexCode || undefined);
    revalidatePath('/dashboard/admin');
  }

  async function handleDeleteColor(colorId: string) {
    'use server';
    await deleteWigColor(colorId);
    revalidatePath('/dashboard/admin');
  }

  async function handleUpdateColor(colorId: string, formData: FormData) {
    'use server';
    const name = formData.get('colorName') as string;
    const hexCode = formData.get('hexCode') as string;
    if (!name) return;
    await updateWigColor(colorId, name, hexCode || undefined);
    revalidatePath('/dashboard/admin');
  }

  // Size Actions
  async function handleCreateSize(formData: FormData) {
    'use server';
    const name = formData.get('sizeName') as string;
    const description = formData.get('sizeDescription') as string;
    if (!name) return;
    await createWigSize(name, description || undefined);
    revalidatePath('/dashboard/admin');
  }

  async function handleDeleteSize(sizeId: string) {
    'use server';
    await deleteWigSize(sizeId);
    revalidatePath('/dashboard/admin');
  }

  async function handleUpdateSize(sizeId: string, formData: FormData) {
    'use server';
    const name = formData.get('sizeName') as string;
    const description = formData.get('sizeDescription') as string;
    if (!name) return;
    await updateWigSize(sizeId, name, description || undefined);
    revalidatePath('/dashboard/admin');
  }

  // Currency Actions
  async function handleCreateCurrency(formData: FormData) {
    'use server';
    const id = formData.get('currencyId') as string;
    const name = formData.get('currencyName') as string;
    const symbol = formData.get('currencySymbol') as string;
    const rate = parseFloat(formData.get('currencyRate') as string);
    if (!id || !name || !symbol || isNaN(rate)) return;
    await createCurrency(id, name, symbol, rate);
    revalidatePath('/dashboard/admin');
  }

  async function handleDeleteCurrency(currencyId: string) {
    'use server';
    await deleteCurrency(currencyId);
    revalidatePath('/dashboard/admin');
  }

  async function handleUpdateCurrency(currencyId: string, formData: FormData) {
    'use server';
    const name = formData.get('currencyName') as string;
    const symbol = formData.get('currencySymbol') as string;
    const rate = parseFloat(formData.get('currencyRate') as string);
    if (!name || !symbol || isNaN(rate)) return;
    await updateCurrency(currencyId, name, symbol, rate);
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Brand Management */}
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

        {/* Wig Color Management */}
        <Card>
          <CardHeader>
            <CardTitle>Wig Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreateColor} className="flex gap-2 mb-4">
              <Input
                type="text"
                name="colorName"
                placeholder="Color Name"
                className="flex-1"
              />
              <Input
                type="text"
                name="hexCode"
                placeholder="Hex Code (optional)"
                className="w-32"
              />
              <Button type="submit">Add Color</Button>
            </form>

            <div className="space-y-2">
              {colors.map((color) => (
                <form
                  key={color.id}
                  action={handleUpdateColor.bind(null, color.id)}
                  className="flex items-center gap-2 group"
                >
                  <Input
                    type="text"
                    name="colorName"
                    defaultValue={color.name}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    name="hexCode"
                    defaultValue={color.hexCode || ''}
                    placeholder="#000000"
                    className="w-32"
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
                    formAction={handleDeleteColor.bind(null, color.id)}
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

        {/* Wig Size Management */}
        <Card>
          <CardHeader>
            <CardTitle>Wig Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreateSize} className="flex gap-2 mb-4">
              <Input
                type="text"
                name="sizeName"
                placeholder="Size Name"
                className="flex-1"
              />
              <Input
                type="text"
                name="sizeDescription"
                placeholder="Description (optional)"
                className="flex-1"
              />
              <Button type="submit">Add Size</Button>
            </form>

            <div className="space-y-2">
              {sizes.map((size) => (
                <form
                  key={size.id}
                  action={handleUpdateSize.bind(null, size.id)}
                  className="flex items-center gap-2 group"
                >
                  <Input
                    type="text"
                    name="sizeName"
                    defaultValue={size.name}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    name="sizeDescription"
                    defaultValue={size.description || ''}
                    placeholder="Description"
                    className="flex-1"
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
                    formAction={handleDeleteSize.bind(null, size.id)}
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

        {/* Currency Management */}
        <Card>
          <CardHeader>
            <CardTitle>Currencies</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreateCurrency} className="grid grid-cols-4 gap-2 mb-4">
              <Input
                type="text"
                name="currencyId"
                placeholder="ID (e.g., USD)"
                className="uppercase"
              />
              <Input
                type="text"
                name="currencyName"
                placeholder="Name"
              />
              <Input
                type="text"
                name="currencySymbol"
                placeholder="Symbol"
              />
              <Input
                type="number"
                name="currencyRate"
                placeholder="Exchange Rate"
                step="0.000001"
                min="0"
              />
              <Button type="submit" className="col-span-4">Add Currency</Button>
            </form>

            <div className="space-y-2">
              {currencies.map((currency) => (
                <form
                  key={currency.id}
                  action={handleUpdateCurrency.bind(null, currency.id)}
                  className="grid grid-cols-[1fr,1fr,auto,auto,auto] gap-2 items-center group"
                >
                  <Input
                    type="text"
                    name="currencyName"
                    defaultValue={currency.name}
                  />
                  <Input
                    type="text"
                    name="currencySymbol"
                    defaultValue={currency.symbol}
                  />
                  <Input
                    type="number"
                    name="currencyRate"
                    defaultValue={currency.rate.toString()}
                    step="0.000001"
                    min="0"
                    className="w-32"
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
                    formAction={handleDeleteCurrency.bind(null, currency.id)}
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
    </div>
  );
}
