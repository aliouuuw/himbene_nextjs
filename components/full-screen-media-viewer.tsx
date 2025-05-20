import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from './ui/button';
import { isVideoFile } from "@/lib/media-utils";

interface FullScreenMediaViewerProps {
  mediaUrls: string[];
  mediaNames: string[];
  initialIndex?: number;
  onClose: () => void;
  wigName?: string;
}

export function FullScreenMediaViewer({
  mediaUrls,
  mediaNames,
  initialIndex = 0,
  onClose,
  wigName
}: FullScreenMediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleNext = () => {
    setIsPlaying(false); // Reset video state when navigating
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const handlePrev = () => {
    setIsPlaying(false); // Reset video state when navigating
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const fileName = mediaNames[currentIndex] || `${wigName || 'media'}-${currentIndex + 1}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-[60]"
        onClick={onClose}
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

      <div className="z-50 relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {isVideoFile(mediaNames[currentIndex]) ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              key={mediaUrls[currentIndex]}
              src={mediaUrls[currentIndex]}
              className="max-w-full max-h-full"
              controls
              autoPlay={!isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={(e) => e.stopPropagation()}
            >
              Votre navigateur ne supporte pas la balise vidéo.
            </video>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={mediaUrls[currentIndex]}
              alt={`${wigName || 'Media'} ${currentIndex + 1}`}
              fill
              priority
              sizes="90vw"
              className="object-contain"
            />
          </div>
        )}

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

        <div className="absolute bottom-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {mediaUrls.length}
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] p-2 bg-black/50 rounded-lg">
          {mediaUrls.map((url, index) => (
            <div
              key={index}
              className={`relative w-16 h-16 cursor-pointer ${
                index === currentIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-75'
              }`}
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(index);
              }}
            >
              {isVideoFile(mediaNames[index]) ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              ) : (
                <Image
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover rounded"
                  sizes="64px"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 