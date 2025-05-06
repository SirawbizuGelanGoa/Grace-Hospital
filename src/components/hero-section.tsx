import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section id="home" className="relative h-[60vh] text-center flex flex-col justify-center items-center text-white">
       <Image
        src="https://picsum.photos/1200/800"
        alt="Hospital building exterior"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="z-0 brightness-50"
        data-ai-hint="hospital building"
      />
      <div className="z-10 container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down">Welcome to MediSync</h1>
        <p className="text-lg md:text-2xl mb-8 animate-fade-in-up delay-200">Your Health, Our Priority. Providing compassionate care.</p>
        <Button size="lg" variant="accent" asChild className="animate-fade-in-up delay-400">
          <Link href="#contact">Book Appointment</Link>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;

// Add simple fade-in keyframes to globals.css if not already present
/*
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; }
.animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
.delay-200 { animation-delay: 0.2s; }
.delay-400 { animation-delay: 0.4s; }
*/
