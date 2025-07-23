import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AboutContent } from '@/lib/schema-types';
import Image from 'next/image';

const AboutSection = async () => {
  let displayContent: AboutContent;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about-content`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch about content');
    }

    displayContent = await response.json();
  } catch (error) {
    console.error("Failed to fetch about content:", error);
    displayContent = {
      id: 'ac_main_default_placeholder',
      title: 'About Us',
      description: 'Information about our hospital is coming soon.',
      mission: 'Our mission will be available shortly.',
      vision: 'Our vision will be available shortly.',
      imageUrl: null,
      imageHint: 'hospital building',
      created_at: new Date().toISOString(),
    };
  }

  return (
    <section id="about" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden shadow-lg">
           <CardHeader className="bg-primary text-primary-foreground">
             <CardTitle className="text-3xl font-bold text-center">{displayContent.title}</CardTitle>
           </CardHeader>
           <CardContent className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Content for the first column */}
            <div className="flex flex-col gap-6">
              <p className="text-lg text-foreground">
                {displayContent.description}
              </p>

              {/* Image for Mobile */}
              <div className="md:hidden relative h-64 rounded-lg overflow-hidden shadow-md">
                {displayContent.imageUrl ? (
                  <Image
                    src={displayContent.imageUrl}
                    alt={`About ${displayContent.title} Image`}
                    fill={true}
                    style={{ objectFit: 'cover' }}
                    quality={75}
                    priority={false}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    data-ai-hint={displayContent.imageHint || 'hospital staff'}
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center text-foreground">
                    Image Not Available
                  </div>
                )}
              </div>

              {/* Mission & Vision */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Our Mission</h3>
                  <p className="text-muted-foreground">{displayContent.mission}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Our Vision</h3>
                  <p className="text-muted-foreground">{displayContent.vision}</p>
                </div>
              </div>
            </div>

            {/* Image for Desktop */}
            <div className="hidden md:block relative h-96 rounded-lg overflow-hidden shadow-md">
              {displayContent.imageUrl ? (
                <Image
                  src={displayContent.imageUrl}
                  alt={`About ${displayContent.title} Image`}
                  fill={true}
                  style={{ objectFit: 'cover' }}
                  quality={75}
                  priority={false}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  data-ai-hint={displayContent.imageHint || 'hospital staff'}
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-foreground">
                  Image Not Available
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
