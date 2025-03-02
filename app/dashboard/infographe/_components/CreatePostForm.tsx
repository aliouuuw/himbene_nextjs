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
import { Brand, WigColor, WigSize } from '@prisma/client';
import { useUploadThing } from '@/lib/uploadthing';
import { Currency } from "@/types";

type WigFormData = {
  name: string;
  description: string;
  basePrice: number;
  colorId: string;
  sizeId: string;
  currencyId: string;
};

interface CreatePostFormProps {
  brands: Brand[];
  colors: WigColor[];
  sizes: WigSize[];
  currencies: Currency[];
}

export function CreatePostForm({ 
  brands,
  colors,
  sizes,
  currencies,
}: CreatePostFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [files, setFiles] = useState<File[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wigData, setWigData] = useState<WigFormData>({
    name: '',
    description: '',
    basePrice: 0,
    colorId: '',
    sizeId: '',
    currencyId: currencies[0]?.id || '',
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
    if (!selectedBrand) {
      toast.error('Please select a brand');
      return;
    }

    // Validate wig data
    if (!wigData.name || !wigData.colorId || !wigData.sizeId || wigData.basePrice <= 0) {
      toast.error('Please fill in all required wig information');
      return;
    }
    
    setIsSubmitting(true);

    try {
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        const uploadResponse = await startUpload(files);
        if (!uploadResponse) {
          throw new Error('Failed to upload media files');
        }
        mediaUrls = uploadResponse.map(file => file.url);
      }

      const result = await createDraftPost({
        content: wigData.description,
        mediaUrls,
        scheduledFor: date,
        brandId: selectedBrand,
        wigData: {
          ...wigData,
          imageUrls: mediaUrls,
        },
      });
      
      if (result.success) {
        toast.success('Draft post created successfully');
        setFiles([]);
        setDate(new Date());
        setWigData({
          name: '',
          description: '',
          basePrice: 0,
          colorId: '',
          sizeId: '',
          currencyId: currencies[0]?.id || '',
        });
        setSelectedBrand('');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to create draft post');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="space-y-4 border rounded-lg p-4 ">
        <h3 className="font-medium">Wig Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="wigName">Wig Name</Label>
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
          <Label htmlFor="wigDescription">Description / Post Content</Label>
          <Textarea
            id="wigDescription"
            value={wigData.description}
            onChange={(e) => handleWigDataChange('description', e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>
        <div className="space-y-2">
        <Label htmlFor="brand">Select Brand</Label>
        <Select
          value={selectedBrand}
          onValueChange={setSelectedBrand}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wigPrice">Price</Label>
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
                      {currency.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wigColor">Color</Label>
            <Select
              value={wigData.colorId}
              onValueChange={(value) => handleWigDataChange('colorId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
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
            <Label htmlFor="wigSize">Size</Label>
            <Select
              value={wigData.sizeId}
              onValueChange={(value) => handleWigDataChange('sizeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a size" />
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
        <Label>Upload Media</Label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 cursor-pointer ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-center text-sm text-gray-600">
            Drag & drop files here, or click to select files
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
                      <span className="text-sm text-gray-500">Video File</span>
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
        <Label>Schedule For (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
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
        {isSubmitting ? 'Creating Draft...' : 'Create Draft Post'}
      </Button>
    </form>
  );
}