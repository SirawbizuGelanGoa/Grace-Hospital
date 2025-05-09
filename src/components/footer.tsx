'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Hospital } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/mock-data';

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
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
          {isLoading ? <span className="animate-pulse">Loading...</span> : hospitalName}
        </div>
        <p className="text-sm mb-4">&copy; {new Date().getFullYear()} {isLoading ? <span className="animate-pulse">Loading...</span> : hospitalName}. All rights reserved.</p>
        <div className="flex justify-center space-x-4 text-sm">
          <Link href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link>
          <span className="opacity-50">|</span>
          <Link href="/terms-of-service" className="hover:text-accent transition-colors">Terms of Service</Link>
           <span className="opacity-50">|</span>
           <Link href="#contact" className="hover:text-accent transition-colors">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
