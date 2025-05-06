import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';

const NewsEventsSection = () => {
  // In a real app, fetch this data from the database
  const newsItems = [
    { id: 1, title: 'MediSync Opens New Cardiology Wing', date: '2024-07-15', summary: 'Our expanded cardiology department offers cutting-edge treatments and diagnostics.', image: 'https://picsum.photos/400/250?random=9', link: '#', hint: 'hospital wing' },
    { id: 2, title: 'Free Health Check-up Camp', date: '2024-07-20', summary: 'Join us for a free health screening event next Saturday. Limited slots available.', image: 'https://picsum.photos/400/250?random=10', link: '#', hint: 'health camp' },
    { id: 3, title: 'Dr. Emily Carter Joins MediSync', date: '2024-07-10', summary: 'We are pleased to welcome renowned neurologist Dr. Carter to our expert team.', image: 'https://picsum.photos/400/250?random=11', link: '#', hint: 'doctor portrait' },
  ];

  return (
    <section id="news" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">News &amp; Events</h2>
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
                  data-ai-hint={item.hint}
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
                  <Link href={item.link}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsEventsSection;
