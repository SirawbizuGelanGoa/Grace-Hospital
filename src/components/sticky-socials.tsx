
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Send } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/mock-data';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

// SVG for TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("h-5 w-5", className)} // Adjusted default size to match others
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94H6.32c.1-.83.02-1.68.02-2.51.01-2.3.01-4.6-.01-6.89-.01-1.02-.33-2.03-.75-2.96-.31-.69-.72-1.33-1.15-1.96C4.23 9.03 4.22 9.03 4.21 9.02v-4.2c1.19.19 2.35.56 3.41 1.11.48.25.91.56 1.32.9.02-1.98 0-3.96-.01-5.94z"></path>
  </svg>
);

const StickySocials = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error("Failed to fetch site settings for sticky socials:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed top-1/2 left-0 z-50 -translate-y-1/2 transform p-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          <Skeleton className="h-8 w-8 rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  if (!siteSettings || (!siteSettings.facebookUrl && !siteSettings.tiktokUrl && !siteSettings.telegramUrl)) {
    return null; // Don't render if no social links are configured
  }

  return (
    <div className="fixed top-1/2 left-0 z-50 -translate-y-1/2 transform p-2">
      <div className="flex flex-col gap-3 rounded-r-lg bg-background/80 p-2 shadow-lg backdrop-blur-sm border border-l-0 border-border">
        {siteSettings.facebookUrl && (
          <Link
            href={siteSettings.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-primary hover:text-accent transition-colors p-1.5 hover:bg-muted rounded-md"
          >
            <Facebook className="h-5 w-5" />
          </Link>
        )}
        {siteSettings.tiktokUrl && (
          <Link
            href={siteSettings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-primary hover:text-accent transition-colors p-1.5 hover:bg-muted rounded-md"
          >
            <TikTokIcon />
          </Link>
        )}
        {siteSettings.telegramUrl && (
          <Link
            href={siteSettings.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="text-primary hover:text-accent transition-colors p-1.5 hover:bg-muted rounded-md"
          >
            <Send className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default StickySocials;
