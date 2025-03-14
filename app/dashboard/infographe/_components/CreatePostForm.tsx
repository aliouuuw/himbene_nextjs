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
import { createDraftPost } from '@/app/actions/post-actions';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brand, WigColor, WigQuality, WigSize } from '@prisma/client';
import { useUploadThing } from '@/lib/uploadthing';
import { Currency } from "@/types";
import { fr } from 'date-fns/locale';
import { CurrencyCode, getCurrencyFlag } from "@/lib/currency-utils";
import { MultiSelect } from "@/components/ui/multi-select";

type WigFormData = {
  name: string;
  description: string;
  basePrice: number;
  colorId: string;
  sizeId: string;
  currencyId: string;
  qualityId: string;
  brandIds: string[];
};

interface CreatePostFormProps {
  brands: Brand[];
  colors: WigColor[];
  sizes: WigSize[];
  currencies: Currency[];
  qualities: WigQuality[];
}

export function CreatePostForm({ 
  brands,
  colors,
  sizes,
  currencies,
  qualities,
}: CreatePostFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wigData, setWigData] = useState<WigFormData>({
    name: '',
    description: '',
    basePrice: 0,
    colorId: '',
    sizeId: '',
    currencyId: currencies.find(c => c.isBase)?.id || currencies[0]?.id || '',
    qualityId: qualities[0]?.id || '',
    brandIds: [],
  });
  const { startUpload } = useUploadThing("postMedia");

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

  const handleWigDataChange = (field: keyof WigFormData, value: string | number) => {
    if (field === 'basePrice') {
      // Handle empty string or invalid number
      const numValue = value === '' ? 0 : parseFloat(value.toString());
      setWigData(prev => ({
        ...prev,
        [field]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setWigData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wigData.brandIds.length === 0) {
      toast.error('Veuillez sélectionner au moins une marque');
      return;
    }

    // Validate wig data
    if (!wigData.name || !wigData.colorId || !wigData.sizeId || wigData.basePrice <= 0) {
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

      const result = await createDraftPost({
        content: wigData.description,
        mediaUrls,
        scheduledFor: date,
        brandIds: wigData.brandIds,
        wigData: {
          ...wigData,
          imageUrls: mediaUrls,
        },
      });
      
      if (result.success) {
        toast.success('Post créé avec succès');
        setFiles([]);
        setDate(new Date());
        setWigData({
          name: '',
          description: '',
          basePrice: 0,
          colorId: '',
          sizeId: '',
          currencyId: currencies.find(c => c.isBase)?.id || currencies[0]?.id || '',  
          qualityId: qualities[0]?.id || '',
          brandIds: [],
        });
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
          <input
            type="text"
            id="wigName"
            value={wigData.name}
            onChange={(e) => handleWigDataChange('name', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wigDescription">Description / Contenu du post</Label>
          <Textarea
            id="wigDescription"
            value={wigData.description}
            onChange={(e) => handleWigDataChange('description', e.target.value)}
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
          selected={wigData.brandIds}
          onChange={(selected) => setWigData(prev => ({ ...prev, brandIds: selected }))}
          placeholder="Sélectionner des marques"
        />
        <Label htmlFor="wigQuality">Qualité</Label>
        <Select
          value={wigData.qualityId}
          onValueChange={(value) => handleWigDataChange('qualityId', value)}
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
                value={wigData.basePrice || ''}
                onChange={(e) => handleWigDataChange('basePrice', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                step="0.01"
                required
              />
              <Select
                value={wigData.currencyId}
                onValueChange={(value) => handleWigDataChange('currencyId', value)}
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
              value={wigData.colorId}
              onValueChange={(value) => handleWigDataChange('colorId', value)}
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
              value={wigData.sizeId}
              onValueChange={(value) => handleWigDataChange('sizeId', value)}
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

      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full"
      >
        {isSubmitting ? 'Création du post...' : 'Créer le post'}
      </Button>
    </form>
  );
}