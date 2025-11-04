'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { getNewsEvents } from '@/lib/api';
import type { NewsEvent } from '@/lib/schema-types';
import { useState, useEffect, useCallback } from 'react';

const NewsEventsSection = () => {
  const [newsItems, setNewsItems] = useState<NewsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const fetchNewsEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getNewsEvents();
      setNewsItems(items);
      // Reset image errors when new data is loaded
      setImageErrors(new Set());
    } catch (error) {
      console.error('Failed to fetch news events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsEvents();
  }, [fetchNewsEvents]);

  // Refresh data when page becomes visible (for admin changes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNewsEvents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchNewsEvents]);

  // Refresh data every 2 minutes to catch admin changes
  useEffect(() => {
    const interval = setInterval(fetchNewsEvents, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [fetchNewsEvents]);

  const handleImageError = (itemId: string) => {
    console.error(`Failed to load image for news item ${itemId}`);
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  if (isLoading) {
    return (
      <section id="news" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">News &amp; Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col overflow-hidden shadow-lg">
                <div className="relative h-48 w-full bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-32" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">News &amp; Events</h2>
        {newsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full">
                    {imageErrors.has(item.id) ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-foreground">
                        <div className="text-center">
                          <p className="text-lg font-semibold">Image Not Available</p>
                          <p className="text-sm text-muted-foreground">News: {item.title}</p>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        quality={70}
                        data-ai-hint={item.hint || 'event image'}
                        onError={() => handleImageError(item.id)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                </div>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary mb-1">{item.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{item.summary}</p>
                </CardContent>
                <CardFooter>
                    <Button variant="link" asChild className="p-0 h-auto text-accent">
                    {/* Updated Link: Point to /news/[id] */}
                    <Link href={`/news/${item.id}`}>Read More</Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        ) : (
            <p className="text-center text-muted-foreground mt-8">No news or events currently available.</p>
        )}
      </div>
    </section>
  );
};

export default NewsEventsSection;
