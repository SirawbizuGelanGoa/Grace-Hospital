import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from '@/components/ui/card';

const GallerySection = () => {
  // In a real app, fetch image/video URLs from the database
  const photos = [
    { id: 1, src: 'https://picsum.photos/400/300?random=1', alt: 'Hospital lobby', hint: 'hospital lobby' },
    { id: 2, src: 'https://picsum.photos/400/300?random=2', alt: 'Modern operating room', hint: 'operating room' },
    { id: 3, src: 'https://picsum.photos/400/300?random=3', alt: 'Patient room interior', hint: 'patient room' },
    { id: 4, src: 'https://picsum.photos/400/300?random=4', alt: 'Hospital garden area', hint: 'hospital garden' },
    { id: 5, src: 'https://picsum.photos/400/300?random=5', alt: 'Doctors consulting', hint: 'doctors consulting' },
    { id: 6, src: 'https://picsum.photos/400/300?random=6', alt: 'Advanced medical equipment', hint: 'medical equipment' },
  ];

  // Placeholder for videos - A real implementation would likely use an iframe or video player
  const videos = [
    { id: 1, src: 'https://picsum.photos/400/300?random=7', alt: 'Hospital Tour Video Placeholder', hint: 'hospital video' },
    { id: 2, src: 'https://picsum.photos/400/300?random=8', alt: 'Patient Testimonial Video Placeholder', hint: 'patient testimonial' },
  ];

  return (
    <section id="gallery" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Gallery</h2>
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto mb-8">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>
          <TabsContent value="photos">
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
                      data-ai-hint={photo.hint}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="videos">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {videos.map((video) => (
                 <Card key={video.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                   <CardContent className="p-0 relative aspect-video bg-muted flex items-center justify-center">
                     {/* Placeholder representation */}
                     <Image
                      src={video.src}
                      alt={video.alt}
                      layout="fill"
                      objectFit="cover"
                      quality={70}
                      data-ai-hint={video.hint}
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
             <p className="text-center text-muted-foreground mt-6 text-sm">Video playback functionality requires further implementation.</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default GallerySection;
