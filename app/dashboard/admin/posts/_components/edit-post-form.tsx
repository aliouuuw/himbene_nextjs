"use client"

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { updatePost } from '@/app/actions/post-actions';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brand, PostType, WigColor, WigQuality, WigSize } from '@prisma/client';
import { useUploadThing } from '@/lib/uploadthing';
import { Currency, PostWithRelations } from "@/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { useRouter } from "next/navigation";
import { Input } from '@/components/ui/input';
import { isVideoFile } from "@/lib/media-utils";

interface EditPostFormProps {
  post: PostWithRelations;
  brands: Brand[];
  colors: WigColor[];
  sizes: WigSize[];
  currencies: Currency[];
  qualities: WigQuality[];
  types: PostType[];
}

// Add these constants at the top of the file
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB in bytes
const MAX_VIDEO_SIZE = 8 * 1024 * 1024; // 8MB in bytes

export function EditPostForm({
  post,
  brands,
  colors,
  sizes,
  currencies,
  qualities,
  types,
}: EditPostFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: post.content || "",
    typeId: post.typeId || types[0]?.id || '',
    brandIds: post.brands?.map(b => b.brand.id) || [],
    mediaNames: post.mediaNames || [],
    wigData: {
      name: post.wig?.name || "",
      description: post.wig?.description || "",
      basePrice: post.wig?.basePrice || 0,
      colorId: post.wig?.color.id || "",
      sizeId: post.wig?.size.id || "",
      qualityId: post.wig?.quality.id || "",
      currencyId: post.wig?.currencyId || "",
      imageUrls: post.mediaUrls as string[] || [],
    },
  });

  const { startUpload } = useUploadThing("postMedia");
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const invalidFiles = acceptedFiles.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      return file.size > maxSize;
    });

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(file => {
        const isVideo = file.type.startsWith('video/');
        const maxSizeMB = isVideo ? '8MB' : '4MB';
        toast.error(
          `Le fichier "${file.name}" est trop volumineux. La taille maximum est de ${maxSizeMB}`
        );
      });

      // Only add valid files
      const validFiles = acceptedFiles.filter(file => {
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        return file.size <= maxSize;
      });
      
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
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

  const removeExistingMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaNames: prev.mediaNames.filter((_, i) => i !== index),
      wigData: {
        ...prev.wigData,
        imageUrls: prev.wigData.imageUrls.filter((_, i) => i !== index),
      }
    }));
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWigSelectChange = (name: string, value: string) => {
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

    if (!formData.wigData.name || !formData.wigData.colorId || !formData.wigData.sizeId || formData.wigData.basePrice <= 0) {
      toast.error('Veuillez remplir toutes les informations de la perruque');
      return;
    }
    
    setIsSubmitting(true);

    try {
      let newMediaUrls: string[] = [];
      let newMediaNames: string[] = [];
      if (files.length > 0) {
        const uploadResponse = await startUpload(files);
        if (!uploadResponse) {
          throw new Error('Erreur lors de la téléchargement des fichiers');
        }
        newMediaUrls = uploadResponse.map(file => file.url);
        newMediaNames = uploadResponse.map(file => file.name);
      }

      const postDataToSubmit = {
        ...formData,
        mediaUrls: [...formData.wigData.imageUrls, ...newMediaUrls],
        mediaNames: [...formData.mediaNames, ...newMediaNames],
        wigData: {
          ...formData.wigData,
          imageUrls: [...formData.wigData.imageUrls, ...newMediaUrls],
        },
      };
      
      const result = await updatePost(post.id, postDataToSubmit);
      
      if (result.success) {
        toast.success('Post modifié avec succès');
        router.push("/dashboard/admin/posts");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erreur lors de la modification du post');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 border rounded-lg p-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type de post</Label>
            <Select
              value={formData.typeId}
              onValueChange={(value) => handleSelectChange('typeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
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

          <div className="space-y-2">
            <Label>Marques</Label>
            <MultiSelect
              options={brands.map(brand => ({
                value: brand.id,
                label: brand.name
              }))}
              selected={formData.brandIds}
              onChange={(values) => setFormData(prev => ({ ...prev, brandIds: values }))}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Couleur</Label>
            <Select
              value={formData.wigData.colorId}
              onValueChange={(value) => handleWigSelectChange('colorId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une couleur" />
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
            <Label>Taille</Label>
            <Select
              value={formData.wigData.sizeId}
              onValueChange={(value) => handleWigSelectChange('sizeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une taille" />
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

          <div className="space-y-2">
            <Label>Qualité</Label>
            <Select
              value={formData.wigData.qualityId}
              onValueChange={(value) => handleWigSelectChange('qualityId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une qualité" />
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Prix de base</Label>
            <Input
              type="number"
              name="basePrice"
              value={formData.wigData.basePrice}
              onChange={handleWigDataChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Devise</Label>
            <Select
              value={formData.wigData.currencyId}
              onValueChange={(value) => handleWigSelectChange('currencyId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une devise" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Médias existants</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.wigData.imageUrls.map((url, index) => {
              const fileName = formData.mediaNames[index];
              const isVideo = isVideoFile(fileName);

              return (
                <div key={index} className="relative aspect-square group">
                  {isVideo ? (
                    <div className="relative w-full h-full rounded-md overflow-hidden">
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      >
                        Votre navigateur ne supporte pas la balise vidéo.
                      </video>
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                          <svg 
                            className="w-4 h-4 text-white" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={url}
                      alt={`Media ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingMedia(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Déposez les fichiers ici ...</p>
          ) : (
            <div className="space-y-2">
              <p>Glissez et déposez des fichiers ici, ou cliquez pour sélectionner des fichiers</p>
              <p className="text-sm text-muted-foreground">
                Images (max 4MB) : .jpg, .jpeg, .png<br />
                Vidéos (max 8MB) : .mp4, .mov
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => {
              const isVideo = file.type.startsWith('video/');
              
              return (
                <div key={index} className="relative aspect-square group">
                  {isVideo ? (
                    <div className="relative w-full h-full rounded-md overflow-hidden bg-black/5">
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                      >
                        Votre navigateur ne supporte pas la balise vidéo.
                      </video>
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                          <svg 
                            className="w-4 h-4 text-white" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      width={200}
                      height={200}
                      className="object-cover rounded-md"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded truncate">
                    {file.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Modification...' : 'Modifier le post'}
        </Button>
      </div>
    </form>
  );
}
