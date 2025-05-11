
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogClose } from "@/components/ui/dialog"; // Removed DialogTitle, DialogTrigger as they are used differently or implicitly
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlayCircle, X, Search } from 'lucide-react'; 
import { getGalleryItems, GalleryItem } from '@/lib/mock-data'; 
import { Skeleton } from '@/components/ui/skeleton';

const GallerySection = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lightbox state for photos
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Video player state
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const items = await getGalleryItems();
        setGalleryItems(items);
        setPhotos(items.filter(item => item.type === 'photo'));
        setVideos(items.filter(item => item.type === 'video'));
      } catch (error) {
        console.error("Failed to fetch gallery items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
  }

  if (isLoading) {
    return (
      <section id="gallery" className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Gallery</h2>
          <Tabs defaultValue="photos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto mb-8">
              <TabsTrigger value="photos"><Skeleton className="h-5 w-20" /></TabsTrigger>
              <TabsTrigger value="videos"><Skeleton className="h-5 w-20" /></TabsTrigger>
            </TabsList>
            <TabsContent value="photos">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden shadow-lg">
                    <CardContent className="p-0 relative aspect-video">
                      <Skeleton className="h-full w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="videos">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden shadow-lg">
                    <CardContent className="p-0 relative aspect-video">
                       <Skeleton className="h-full w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    );
  }
  

  return (
    <section id="gallery" className="py-16 bg-secondary">
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
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        layout="fill"
                        objectFit="cover"
                        quality={70}
                        data-ai-hint={photo.hint || 'hospital image'}
                        unoptimized={photo.src.startsWith('data:')}
                      />
                       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                          <Search className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110" />
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground mt-6">No photos available in the gallery.</p>
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
                      <Image
                        src={video.src} 
                        alt={video.alt}
                        layout="fill"
                        objectFit="cover"
                        quality={70}
                        data-ai-hint={video.hint || 'hospital video thumbnail'}
                        unoptimized={video.src.startsWith('data:')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-opacity duration-300 flex flex-col items-center justify-center text-center text-white p-4">
                        <PlayCircle className="h-12 w-12 mb-2 text-white transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-sm font-medium">{video.alt}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground mt-6">No videos available in the gallery.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Photo Lightbox Dialog */}
      {isLightboxOpen && photos.length > 0 && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl w-full p-0 border-0 bg-black/90 shadow-none overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
            <div className="relative aspect-[16/10] flex items-center justify-center">
              <Image
                src={photos[currentPhotoIndex].src}
                alt={photos[currentPhotoIndex].alt}
                layout="fill"
                objectFit="contain"
                quality={90}
                unoptimized={photos[currentPhotoIndex].src.startsWith('data:')}
              />
               <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-[60] text-white hover:bg-white/20"
                  onClick={closeLightbox}
                  aria-label="Close lightbox"
                >
                  <X className="h-6 w-6" />
                </Button>
              </DialogClose>
            </div>
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[60] text-white hover:bg-white/20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[60] text-white hover:bg-white/20"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/70 px-3 py-1 rounded-md z-[60]">
                    {currentPhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Video Player Dialog */}
      {isVideoPlayerOpen && selectedVideo && (
         <Dialog open={isVideoPlayerOpen} onOpenChange={(open) => !open && closeVideoPlayer()}>
            <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl w-full p-0 border-0 bg-black data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
             <DialogHeader className="absolute top-0 right-0 z-[60] p-2"> {/* For close button positioning */}
                 <DialogClose asChild>
                     <Button
                         variant="ghost"
                         size="icon"
                         className="text-white hover:bg-white/20"
                         onClick={closeVideoPlayer}
                         aria-label="Close video player"
                     >
                         <X className="h-6 w-6" />
                     </Button>
                 </DialogClose>
             </DialogHeader>
             <div className="aspect-video">
                 <video
                    // If selectedVideo.src is an image (from picsum), this won't play.
                    // For actual video playback, selectedVideo.src must be a valid video URL.
                    src={selectedVideo.src} 
                    controls
                    autoPlay
                    className="w-full h-full"
                    aria-label={`Video player for ${selectedVideo.alt}`}
                    poster={selectedVideo.type === 'video' && !selectedVideo.src.startsWith('data:video') ? selectedVideo.src : undefined} // Use image src as poster if it's not a data URI video
                 >
                    Your browser does not support the video tag.
                 </video>
             </div>
            </DialogContent>
         </Dialog>
      )}

    </section>
  );
};

export default GallerySection;
