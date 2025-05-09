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
           <CardContent className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Content for the first column on desktop, and main flow for mobile */}
            <div className="flex flex-col gap-6">
              {/* Description */}
              <p className="text-lg text-foreground">
                {aboutContent.description}
              </p>

              {/* Image for Mobile - displayed only on mobile screens, after description */}
              <div className="md:hidden relative h-64 rounded-lg overflow-hidden shadow-md">
                {aboutContent.imageUrl ? (
                  <Image
                    src={aboutContent.imageUrl}
                    alt={`About ${aboutContent.title || 'Grace Hospital'} Image`}
                    layout="fill"
                    objectFit="cover"
                    quality={75}
                    data-ai-hint={aboutContent.imageHint || 'hospital staff'}
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center text-foreground">
                    Image Placeholder
                  </div>
                )}
              </div>

              {/* Mission & Vision */}
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

            {/* Image for Desktop - displayed only on md screens and up, in the second column */}
            <div className="hidden md:block relative h-96 rounded-lg overflow-hidden shadow-md">
              {aboutContent.imageUrl ? (
                <Image
                  src={aboutContent.imageUrl}
                  alt={`About ${aboutContent.title || 'Grace Hospital'} Image`}
                  layout="fill"
                  objectFit="cover"
                  quality={75}
                  data-ai-hint={aboutContent.imageHint || 'hospital staff'}
                />
              ) : (
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
