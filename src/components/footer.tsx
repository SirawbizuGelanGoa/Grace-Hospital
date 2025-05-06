import Link from 'next/link';
import { Hospital } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-16">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-4 text-lg font-bold">
          <Hospital className="h-5 w-5" />
          MediSync Hospital
        </div>
        <p className="text-sm mb-4">&copy; {new Date().getFullYear()} MediSync Hospital. All rights reserved.</p>
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
