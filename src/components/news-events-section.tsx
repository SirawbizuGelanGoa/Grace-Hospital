import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { getNewsEvents } from '@/lib/mock-data'; // Import data fetching function

const NewsEventsSection = async () => {
  // Fetch news items from the mock source
  const newsItems = await getNewsEvents();

  return (
    <section id="news" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">News &amp; Events</h2>
        {newsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full">
                    <Image
                    src={item.image}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    quality={70}
                    data-ai-hint={item.hint || 'event image'} // Use hint or default
                    />
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
                    {/* Update link handling - could be internal or external */}
                    <Link href={item.link || '#'}>Read More</Link>
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
