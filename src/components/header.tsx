'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Hospital, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSiteSettings, SiteSettings } from '@/lib/mock-data'; // Import getSiteSettings

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
        // Fallback settings if fetch fails
        setSiteSettings({ hospitalName: 'Grace Hospital', logoUrl: '' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: '/#about', label: 'About Us' },
    { href: '/#services', label: 'Services' },
    { href: '/#facilities', label: 'Facilities' },
    { href: '/#departments', label: 'Departments' },
    { href: '/#gallery', label: 'Gallery' },
    { href: '/#news', label: 'News & Events' },
    { href: '/#contact', label: 'Contact' },
  ];

  const hospitalName = siteSettings?.hospitalName || 'Grace Hospital';
  const logoUrl = siteSettings?.logoUrl;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-primary/95 shadow-md backdrop-blur-sm' : 'bg-primary'
      )}
    >
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Hospital Name */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary-foreground" onClick={closeMenu}>
            {isLoading ? (
              <div className="h-8 w-8 md:h-10 md:w-10 bg-primary-foreground/20 rounded-sm animate-pulse" />
            ) : logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${hospitalName} Logo`}
                width={40}
                height={40}
                className="h-8 w-8 md:h-10 md:w-10 rounded-sm object-contain"
                data-ai-hint="hospital logo"
              />
            ) : (
              <Hospital className="h-6 w-6 md:h-7 md:w-7" />
            )}
            {isLoading ? <div className="h-6 w-32 bg-primary-foreground/20 rounded animate-pulse" /> : hospitalName}
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-primary-foreground hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="text-primary-foreground hover:bg-primary/80 focus:bg-primary/80"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isMenuOpen ? 'max-h-screen py-4' : 'max-h-0 py-0'
          )}
        >
          <ul className="flex flex-col space-y-4 items-center">
             {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-primary-foreground hover:text-accent transition-colors text-lg py-1"
                  onClick={closeMenu} // Close menu on link click
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
