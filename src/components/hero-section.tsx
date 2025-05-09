'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroSlides, HeroSlide } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true);
        const fetchedSlides = await getHeroSlides();
        setSlides(fetchedSlides);
      } catch (error) {
        console.error("Failed to fetch hero slides:", error);
        // Optionally set an error state and display a message
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const goToPrevious = useCallback(() => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setTimeout(goToNext, 5000); // Auto slide every 5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentIndex, slides.length, goToNext]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  if (isLoading) {
    return (
      <section id="home" className="relative h-[60vh] w-full bg-muted flex justify-center items-center">
        <Skeleton className="h-full w-full" />
        <div className="absolute z-10 text-center text-white">
          <Skeleton className="h-12 w-72 md:h-16 md:w-96 mb-4" />
          <Skeleton className="h-6 w-60 md:h-8 md:w-80 mb-8" />
          <Skeleton className="h-12 w-36" />
        </div>
      </section>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <section id="home" className="relative h-[60vh] bg-muted flex justify-center items-center text-center">
        <p className="text-foreground">No hero images available at the moment.</p>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <section id="home" className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden group">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            layout="fill"
            objectFit="cover"
            quality={80}
            priority={index === 0} // Prioritize loading the first image
            className="brightness-50"
            data-ai-hint={slide.hint || 'hero background'}
          />
        </div>
      ))}
      
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white p-4">
        {currentSlide.title && (
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down">
            {currentSlide.title}
          </h1>
        )}
        {currentSlide.subtitle && (
          <p className="text-lg md:text-2xl mb-8 animate-fade-in-up delay-200 max-w-2xl">
            {currentSlide.subtitle}
          </p>
        )}
        {currentSlide.ctaText && currentSlide.ctaLink && (
          <Button size="lg" variant="accent" asChild className="animate-fade-in-up delay-400">
            <Link href={currentSlide.ctaLink}>{currentSlide.ctaText}</Link>
          </Button>
        )}
      </div>

      {slides.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute z-30 top-1/2 left-4 transform -translate-y-1/2 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute z-30 top-1/2 right-4 transform -translate-y-1/2 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Dot Indicators */}
          <div className="absolute z-30 bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
                className={`h-3 w-3 rounded-full transition-colors duration-300 ${
                  currentIndex === slideIndex ? 'bg-accent' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;
