import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Hospital } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Hospital className="h-6 w-6" />
          MediSync
        </Link>
        <ul className="flex space-x-6 items-center">
          <li><Link href="#about" className="hover:text-accent transition-colors">About Us</Link></li>
          <li><Link href="#services" className="hover:text-accent transition-colors">Services</Link></li>
          <li><Link href="#facilities" className="hover:text-accent transition-colors">Facilities</Link></li>
          <li><Link href="#departments" className="hover:text-accent transition-colors">Departments</Link></li>
          <li><Link href="#gallery" className="hover:text-accent transition-colors">Gallery</Link></li>
          <li><Link href="#news" className="hover:text-accent transition-colors">News & Events</Link></li>
          <li><Link href="#contact" className="hover:text-accent transition-colors">Contact</Link></li>
          <li>
            {/* Placeholder for Admin Link - Replace with actual admin route */}
            <Button variant="accent" size="sm" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
