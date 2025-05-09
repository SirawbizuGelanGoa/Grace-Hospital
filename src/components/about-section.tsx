import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAboutContent } from '@/lib/mock-data'; // Import data fetching function

const AboutSection = async () => {
  // Fetch content from the mock data source
  const aboutContent = await getAboutContent();

  return (
    <section id="about" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden shadow-lg">
           <CardHeader className="bg-primary text-primary-foreground">
             <CardTitle className="text-3xl font-bold text-center">{aboutContent.title || 'About Us'}</CardTitle>
           </CardHeader>
           <CardContent className="p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg mb-6 text-foreground">{aboutContent.description}</p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Our Mission</h3>
                  <p className="text-muted-foreground">{aboutContent.mission}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Our Vision</h3>
                  <p className="text-muted-foreground">{aboutContent.vision}</p>
                </div>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-md">
              {aboutContent.imageUrl && (
                 <Image
                  src={aboutContent.imageUrl}
                  alt={`About ${aboutContent.title || 'Grace Hospital'} Image`}
                  layout="fill"
                  objectFit="cover"
                  quality={75}
                  data-ai-hint={aboutContent.imageHint || 'hospital staff'} // Use hint from data or default
                 />
              )}
              {!aboutContent.imageUrl && (
                 <div className="h-full w-full bg-muted flex items-center justify-center text-foreground">
                   Image Placeholder
                 </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutSection;
