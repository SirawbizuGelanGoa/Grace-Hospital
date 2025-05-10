
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Hospital, Facebook, Send, Video } from 'lucide-react'; 
import { getSiteSettings, SiteSettings } from '@/lib/mock-data';
import { Skeleton } from './ui/skeleton'; 

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    // Set year on client-side to prevent hydration mismatch
    setCurrentYear(new Date().getFullYear());

    const fetchSettings = async () => {
      setIsLoading(true); // Set loading true before fetch
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error("Failed to fetch site settings for footer:", error);
        setSiteSettings({ hospitalName: 'Grace Hospital', logoUrl: '' }); // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const hospitalName = siteSettings?.hospitalName || 'Grace Hospital';

  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-4 text-lg font-bold">
          <Hospital className="h-5 w-5" />
          {isLoading && !siteSettings ? <Skeleton className="h-6 w-32 bg-primary-foreground/20" /> : hospitalName}
        </div>
        <p className="text-sm mb-4">
          &copy; {currentYear === null ? <Skeleton className="inline-block h-4 w-10 bg-primary-foreground/20" /> : currentYear}{' '}
          {isLoading && !siteSettings ? <Skeleton className="inline-block h-4 w-24 bg-primary-foreground/20" /> : hospitalName}. All rights reserved.
        </p>
        <div className="flex justify-center space-x-4 text-sm mb-6">
          <Link href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link>
          <span className="opacity-50">|</span>
          <Link href="/terms-of-service" className="hover:text-accent transition-colors">Terms of Service</Link>
           <span className="opacity-50">|</span>
           <Link href="#contact" className="hover:text-accent transition-colors">Contact Us</Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-6 rounded-full bg-primary-foreground/20" />
              <Skeleton className="h-6 w-6 rounded-full bg-primary-foreground/20" />
              <Skeleton className="h-6 w-6 rounded-full bg-primary-foreground/20" />
            </>
          ) : (
            <>
              {siteSettings?.facebookUrl && (
                <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-accent transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {siteSettings?.tiktokUrl && (
                <a href={siteSettings.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-accent transition-colors">
                  <Video className="h-6 w-6" /> {/* Using Video as a placeholder for TikTok */}
                </a>
              )}
              {siteSettings?.telegramUrl && (
                <a href={siteSettings.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="hover:text-accent transition-colors">
                  <Send className="h-6 w-6" />
                </a>
              )}
            </>
          )}
        </div>

      </div>
    </footer>
  );
};

export default Footer;

    