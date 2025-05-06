import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from '@/components/ui/card';
import { getGalleryItems } from '@/lib/mock-data'; // Import data fetching function

const GallerySection = async () => {
  // Fetch gallery items from the mock source
  const galleryItems = await getGalleryItems();
  const photos = galleryItems.filter(item => item.type === 'photo');
  const videos = galleryItems.filter(item => item.type === 'video');

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
                {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-0 relative aspect-video">
                        <Image
                        src={photo.src}
                        alt={photo.alt}
                        layout="fill"
                        objectFit="cover"
                        quality={70}
                        data-ai-hint={photo.hint || 'hospital image'} // Use hint or default
                        />
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
                     <Card key={video.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                     <CardContent className="p-0 relative aspect-video bg-muted flex items-center justify-center">
                         {/* Placeholder representation - Actual video player needed */}
                         <Image
                         src={video.src} // Use video src for thumbnail/placeholder image
                         alt={video.alt}
                         layout="fill"
                         objectFit="cover"
                         quality={70}
                         data-ai-hint={video.hint || 'hospital video'}
                        />
                         <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center text-white p-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                             <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         <span className="text-sm font-medium">{video.alt}</span>
                         </div>
                     </CardContent>
                     </Card>
                 ))}
                 </div>
             ) : (
                <p className="text-center text-muted-foreground mt-6">No videos available in the gallery.</p>
             )}
             {videos.length > 0 && (
                 <p className="text-center text-muted-foreground mt-6 text-sm">Video playback functionality requires further implementation.</p>
             )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default GallerySection;
