import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import AboutSection from '@/components/about-section';
import ServicesSection from '@/components/services-section';
import FacilitiesSection from '@/components/facilities-section';
import DepartmentsSection from '@/components/departments-section';
import GallerySection from '@/components/gallery-section';
import NewsEventsSection from '@/components/news-events-section';
import ContactSection from '@/components/contact-section';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <FacilitiesSection />
        <DepartmentsSection />
        <GallerySection />
        <NewsEventsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
