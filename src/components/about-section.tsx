import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Import the function to fetch data using the centralized API client
import { getAboutContent, type AboutContent } from '@/lib/mock-data';

// Define the structure of the About Content data (can reuse the type from mock-data)
type AboutContentData = AboutContent;

// Removed the local performFetch function as we now use getAboutContent from mock-data.ts

const AboutSection = async () => {
  // --- CORRECTED: Use getAboutContent from mock-data.ts --- 
  // This function handles server-side vs client-side URL construction
  const aboutContent = await getAboutContent();
  // --- End of correction ---

  const defaultContent: AboutContentData = {
    // Use the type structure, providing default values
    id: 'ac_main_default_placeholder', // Match default ID structure from mock-data
    title: 'About Us',
    description: 'Information about our hospital is coming soon.',
    mission: 'Our mission will be available shortly.',
    vision: 'Our vision will be available shortly.',
    imageUrl: null,
    imageHint: 'hospital building',
    created_at: new Date().toISOString(), // Add default created_at
  };

  // Use the fetched content or the default if fetch failed or returned null/empty
  // Note: getAboutContent already returns a default if fetch fails, 
  // so this || defaultContent might be redundant but safe.
  const displayContent = aboutContent || defaultContent;

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
