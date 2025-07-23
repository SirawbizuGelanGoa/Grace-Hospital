'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import type { AboutContent } from '@/lib/schema-types';

const AboutSection = () => {
  const [displayContent, setDisplayContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about-content`);
        if (!response.ok) {
          throw new Error('Failed to fetch about content');
        }
        const data = await response.json();
        setDisplayContent(data);
      } catch (error) {
        console.error("Failed to fetch about content:", error);
      }
    };
    fetchAboutContent();
  }, []);

  if (!displayContent) {
    return (
      <section id="about" className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-3xl font-bold text-center">About Us</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              <p className="text-lg text-foreground">
                Information about our hospital is coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
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
