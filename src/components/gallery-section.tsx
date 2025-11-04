
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getGalleryItems } from '@/lib/api';
import type { GalleryItem } from '@/lib/schema-types';
import GalleryClient from './gallery-client';

export default function GallerySection() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGalleryItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getGalleryItems();
      setGalleryItems(items);
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Refresh data when page becomes visible (for admin changes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchGalleryItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchGalleryItems]);

  // Refresh data every 2 minutes to catch admin changes
  useEffect(() => {
    const interval = setInterval(fetchGalleryItems, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [fetchGalleryItems]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const photos = galleryItems.filter(item => item.type === 'photo');
  const videos = galleryItems.filter(item => item.type === 'video');

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
      <GalleryClient photos={photos} videos={videos} />
    </section>
  );
}
