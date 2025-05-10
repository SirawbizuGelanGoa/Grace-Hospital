'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getNewsEventById, NewsEvent } from '@/lib/mock-data';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewsArticlePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  
  const [newsItem, setNewsItem] = useState<NewsEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const fetchNewsItem = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const item = await getNewsEventById(id);
          if (item) {
            setNewsItem(item);
          } else {
            setError('News item not found.');
          }
        } catch (err) {
          console.error('Failed to fetch news item:', err);
          setError('Failed to load news item. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchNewsItem();
    } else {
      setError('Invalid news item ID.');
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const windowHeight = window.innerHeight;
        // Total scrollable height of the content itself
        const contentScrollHeight = element.scrollHeight;
        // How much of the content is visible in the viewport
        const contentVisibleHeight = element.clientHeight; 
        // Current scroll position within the content element
        const scrollTop = element.scrollTop;

        if (contentScrollHeight <= contentVisibleHeight) {
          setScrollProgress(100); // Content fits viewport, consider it fully read
        } else {
          // Calculate progress based on how much of the scrollable content has been scrolled past
          const currentProgress = (scrollTop / (contentScrollHeight - contentVisibleHeight)) * 100;
          setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      // Initial check in case content is already scrollable or fully visible
      handleScroll(); 
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [newsItem]); // Re-attach listener if newsItem changes (content height might change)

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <div className="mb-4">
             <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <Skeleton className="w-full h-72 md:h-96 mb-8 rounded-lg" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <p className="text-destructive text-xl mb-4">{error}</p>
          <Button asChild variant="outline">
            <Link href="/#news"><ArrowLeft className="mr-2 h-4 w-4"/> Back to News</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!newsItem) {
    // This case should ideally be handled by the error state, but as a fallback:
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p>News item could not be loaded.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="sticky top-[var(--header-height,68px)] z-40 bg-background py-2 mb-2">
           <Progress value={scrollProgress} className="w-full h-1.5" />
        </div>
        
        <article className="max-w-3xl mx-auto">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="border-b">
               <div className="mb-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/#news"><ArrowLeft className="mr-2 h-4 w-4"/> Back to News</Link>
                </Button>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                {newsItem.title}
              </CardTitle>
              <CardDescription className="flex items-center text-muted-foreground pt-2">
                <CalendarDays className="mr-2 h-4 w-4" />
                {new Date(newsItem.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </CardHeader>
            
            <div className="relative w-full h-64 md:h-96 my-6">
              <Image
                src={newsItem.image}
                alt={newsItem.title}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
                data-ai-hint={newsItem.hint || 'news article image'}
              />
            </div>

            <CardContent 
                ref={contentRef} 
                className="prose max-w-none prose-sm sm:prose lg:prose-lg xl:prose-xl text-foreground py-6 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50"
            >
              {/* Render fullContent, assuming it's plain text or simple Markdown-like structure.
                  For actual Markdown rendering, a library like 'react-markdown' would be needed.
                  Using whitespace-pre-wrap to respect newlines from textarea.
              */}
              <div className="whitespace-pre-wrap">
                {newsItem.fullContent}
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </div>
  );
}
