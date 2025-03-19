import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from './ui/button';

interface FullScreenMediaViewerProps {
  mediaUrls: string[];
  initialIndex?: number;
  onClose: () => void;
  wigName?: string;
}

export function FullScreenMediaViewer({
  mediaUrls, 
  initialIndex = 0, 
  onClose,
  wigName
}: FullScreenMediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${wigName || 'image'}-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-[60]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="h-6 w-6" />
      </Button>

      {mediaUrls.length > 1 && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 text-white hover:bg-white/20 z-[60]"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 text-white hover:bg-white/20 z-[60]"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      <div className="relative w-full h-full max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <Image
          src={mediaUrls[currentIndex]}
          alt={`${wigName || 'Image'} ${currentIndex + 1}`}
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute bottom-4 right-4 text-white hover:bg-white/20 z-[60]"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(mediaUrls[currentIndex]);
          }}
        >
          <Download className="h-6 w-6" />
        </Button>
      </div>

      {mediaUrls.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-[60]">
          {mediaUrls.map((_, index) => (
            <button 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
} 