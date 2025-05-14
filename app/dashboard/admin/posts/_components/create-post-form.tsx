"use client"

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { createDraftPost, CreatePostInput } from '@/app/actions/post-actions';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brand, PostType, WigColor, WigQuality, WigSize } from '@prisma/client';
import { useUploadThing } from '@/lib/uploadthing';
import { Currency } from "@/types";
import { fr } from 'date-fns/locale';
import { CurrencyCode, getCurrencyFlag } from "@/lib/currency-utils";
import { MultiSelect } from "@/components/ui/multi-select";
import { useRouter } from "next/navigation";
import { Input } from '@/components/ui/input';

interface CreatePostFormProps {
  brands: Brand[];
  colors: WigColor[];
  sizes: WigSize[];
  currencies: Currency[];
  qualities: WigQuality[];
  types: PostType[];
}

// Define an initial state structure based on CreatePostInput
const initialFormData: Omit<CreatePostInput, 'mediaUrls'> & { mediaUrlsString: string } = {
  content: "",
  typeId: "",
  brandIds: [],
  wigData: {
    name: "",
    description: "",
    basePrice: 0,
    colorId: "",
    sizeId: "",
    qualityId: "",
    currencyId: "",
    imageUrls: [], // This will be handled by mediaUrlsString for simplicity in form
  },
  mediaUrlsString: "", // For comma-separated media URLs
};

export function CreatePostForm({ 
  brands,
  colors,
  sizes,
  currencies,
  qualities,
  types,
}: CreatePostFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ...initialFormData,
    typeId: types[0]?.id || '',
    wigData: {
      ...initialFormData.wigData,
      currencyId: currencies.find(c => c.isBase)?.id || currencies[0]?.id || '',
      qualityId: qualities[0]?.id || '',
    }
  });
  const { startUpload } = useUploadThing("postMedia");
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.mov']
    },
    maxFiles: 10
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWigDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      wigData: {
        ...prev.wigData,
        [name]: name === 'basePrice' ? Number(value) : value,
      }
    }));
  };

  const handleSelectChange = (name: keyof Omit<CreatePostInput, 'mediaUrls' | 'wigData' | 'brandIds'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWigSelectChange = (name: keyof CreatePostInput['wigData'], value: string) => {
    setFormData(prev => ({
      ...prev,
      wigData: {
        ...prev.wigData,
        [name]: value,
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.brandIds.length === 0) {
      toast.error('Veuillez sélectionner au moins une marque');
      return;
    }

    // Validate wig data
    if (!formData.wigData.name || !formData.wigData.colorId || !formData.wigData.sizeId || formData.wigData.basePrice <= 0) {
      toast.error('Veuillez remplir toutes les informations de la perruque');
      return;
    }
    
    setIsSubmitting(true);

    try {
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        const uploadResponse = await startUpload(files);
        if (!uploadResponse) {
          throw new Error('Erreur lors de la téléchargement des fichiers');
        }
        mediaUrls = uploadResponse.map(file => file.url);
      }

      const postDataToSubmit: CreatePostInput = {
        ...formData,
        mediaUrls: mediaUrls,
        wigData: {
          ...formData.wigData,
          imageUrls: mediaUrls,
          description: formData.content,
        },
      };
      
      const result = await createDraftPost(postDataToSubmit);
      
      if (result.success) {
        toast.success('Post créé avec succès');
        setFiles([]);
        setDate(new Date());
        setFormData({
          ...initialFormData,
          typeId: types[0]?.id || '',
          wigData: {
            ...initialFormData.wigData,
            currencyId: currencies.find(c => c.isBase)?.id || currencies[0]?.id || '',
            qualityId: qualities[0]?.id || '',
          },
        });
        router.push("/dashboard/admin/posts");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erreur lors de la création du post');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="space-y-4 border rounded-lg p-4 ">
        <h3 className="font-medium">Informations sur la perruque</h3>
        
        <div className="space-y-2">
            <Label htmlFor="wigName">Nom de la perruque</Label>
            <Input
              type="text"
              id="wigName"
              name="name"
              value={formData.wigData.name}
              onChange={handleWigDataChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wigDescription">Description / Contenu du post</Label>
          <Textarea
            id="wigDescription"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className="min-h-[100px]"
            required
          />
        </div>
        <div className="space-y-2">
        <Label htmlFor="brands">Marques</Label>
        <MultiSelect
          options={brands.map(brand => ({
            label: brand.name,
            value: brand.id
          }))}
          selected={formData.brandIds}
          onChange={(selected) => setFormData(prev => ({ ...prev, brandIds: selected }))}
          placeholder="Sélectionner des marques"
        />
        <Label htmlFor="wigQuality">Qualité</Label>
        <Select
          value={formData.wigData.qualityId}
          onValueChange={(value) => handleWigSelectChange('qualityId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir une qualité" />
          </SelectTrigger>
          <SelectContent>
            {qualities.map((quality) => (
              <SelectItem key={quality.id} value={quality.id}>
                {quality.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
      </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wigPrice">Prix local</Label>
            <div className="flex gap-2">
              <input
                type="number"
                id="wigPrice"
                name="basePrice"
                value={formData.wigData.basePrice || ''}
                onChange={handleWigDataChange}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                step="0.01"
                required
              />
              <Select
                value={formData.wigData.currencyId}
                onValueChange={(value) => handleWigSelectChange('currencyId', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      <div className="flex items-center gap-2">
                        <Image 
                          src={getCurrencyFlag(currency.id as CurrencyCode)} 
                          alt={currency.id}
                          width={20}
                          height={15}
                          className="rounded-sm"
                        />
                        {currency.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wigColor">Couleur</Label>
            <Select
              value={formData.wigData.colorId}
              onValueChange={(value) => handleWigSelectChange('colorId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une couleur" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.id} value={color.id}>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wigSize">Taille</Label>
            <Select
              value={formData.wigData.sizeId}
              onValueChange={(value) => handleWigSelectChange('sizeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une taille" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Télécharger des médias</Label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 cursor-pointer ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-center text-sm text-gray-600">
            Glissez-déposez des fichiers ici, ou cliquez pour sélectionner des fichiers
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative">
                  {file.type.startsWith('image/') ? (
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-sm text-gray-500">Fichier vidéo</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Planifier pour (Optionnel)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postType">Type de post</Label>
        <Select
          value={formData.typeId}
          onValueChange={(value) => handleSelectChange('typeId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un type de post" />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? 'Création du post...' : 'Créer le post'}
        </Button>
      </div>
    </form>
  );
}