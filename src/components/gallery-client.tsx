'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlayCircle, X } from 'lucide-react';
import type { GalleryItem } from '@/lib/schema-types';

export default function GalleryClient({ photos, videos }: { photos: GalleryItem[], videos: GalleryItem[] }) {
  // Lightbox state for photos
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Video player state
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<GalleryItem | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const nextPhoto = useCallback(() => {
    if (photos.length > 0) {
        setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
     if (photos.length > 0) {
        setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
     }
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLightboxOpen && photos.length > 0) {
        if (event.key === 'ArrowRight') nextPhoto();
        if (event.key === 'ArrowLeft') prevPhoto();
        if (event.key === 'Escape') closeLightbox();
      } else if (isVideoPlayerOpen && event.key === 'Escape') {
        closeVideoPlayer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextPhoto, prevPhoto, photos.length, isVideoPlayerOpen]);

  const openVideoPlayer = (video: GalleryItem) => {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };
  
  const closeVideoPlayer = () => {
    setSelectedVideo(null);
    setIsVideoPlayerOpen(false);
  };

  const handleImageError = (itemId: string) => {
    console.error(`Failed to load image for gallery item ${itemId}`);
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-primary mb-12">Gallery</h2>
      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto mb-8">
          <TabsTrigger value="photos" disabled={photos.length === 0}>Photos ({photos.length})</TabsTrigger>
          <TabsTrigger value="videos" disabled={videos.length === 0}>Videos ({videos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          {photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, index) => (
                <Card
                  key={photo.id}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  onClick={() => openLightbox(index)}
                  onKeyDown={(e) => {if(e.key === 'Enter' || e.key === ' ') openLightbox(index)}}
                  tabIndex={0}
                  role="button"
                  aria-label={`View image ${photo.alt}`}
                >
                  <CardContent className="p-0 relative aspect-video">
                    {imageErrors.has(photo.id) ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-foreground">
                        <div className="text-center">
                          <p className="text-lg font-semibold">Image Not Available</p>
                          <p className="text-sm text-muted-foreground">{photo.alt}</p>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                        quality={70}
                        unoptimized={photo.src.startsWith('data:')}
                        onError={() => handleImageError(photo.id)}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No photos available</p>
          )}
        </TabsContent>

        <TabsContent value="videos">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  onClick={() => openVideoPlayer(video)}
                  onKeyDown={(e) => {if(e.key === 'Enter' || e.key === ' ') openVideoPlayer(video)}}
                  tabIndex={0}
                  role="button"
                  aria-label={`Play video ${video.alt}`}
                >
                  <CardContent className="p-0 relative aspect-video bg-muted flex items-center justify-center">
                    {imageErrors.has(video.id) ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-foreground">
                        <div className="text-center">
                          <PlayCircle className="w-16 h-16 text-muted-foreground mb-2" />
                          <p className="text-lg font-semibold">Video Available</p>
                          <p className="text-sm text-muted-foreground">{video.alt}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <video
                          src={video.src}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                          onError={() => handleImageError(video.id)}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                          <PlayCircle className="w-16 h-16 text-white" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No videos available</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Photo Lightbox Dialog */}
      {isLightboxOpen && photos.length > 0 && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl w-full p-0 border-0 bg-black/90 shadow-none overflow-hidden">
            <DialogHeader>
              <DialogTitle className="sr-only">Photo Lightbox</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-[16/10] flex items-center justify-center">
              <Image
                src={photos[currentPhotoIndex].src}
                alt={photos[currentPhotoIndex].alt}
                fill
                className="object-contain"
                quality={90}
                unoptimized={photos[currentPhotoIndex].src.startsWith('data:')}
              />
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
              
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Player Dialog */}
      {isVideoPlayerOpen && selectedVideo && (
        <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>{selectedVideo.alt}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <video
                src={selectedVideo.src}
                controls
                autoPlay
                className="w-full h-full"
                aria-label={`Video player for ${selectedVideo.alt}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}