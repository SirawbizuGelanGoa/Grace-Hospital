import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutSection = () => {
  // In a real app, fetch this content from the database
  const aboutContent = {
    title: 'About MediSync Hospital',
    description: 'MediSync Hospital is committed to providing exceptional healthcare services with compassion and expertise. Our state-of-the-art facility is equipped with the latest technology, and our dedicated team of medical professionals works tirelessly to ensure the well-being of our patients. We believe in a patient-centric approach, offering personalized care tailored to individual needs.',
    mission: 'Our mission is to improve the health of our community by delivering high-quality, accessible, and comprehensive healthcare services.',
    vision: 'Our vision is to be the leading healthcare provider in the region, recognized for clinical excellence, patient satisfaction, and innovation.'
  };

  return (
    <section id="about" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden shadow-lg">
           <CardHeader className="bg-primary text-primary-foreground">
             <CardTitle className="text-3xl font-bold text-center">{aboutContent.title}</CardTitle>
           </CardHeader>
           <CardContent className="p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg mb-6 text-foreground">{aboutContent.description}</p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Our Mission</h3>
                  <p className="text-muted-foreground">{aboutContent.mission}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Our Vision</h3>
                  <p className="text-muted-foreground">{aboutContent.vision}</p>
                </div>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-md">
              <Image
                src="https://picsum.photos/600/400"
                alt="Diverse team of doctors"
                layout="fill"
                objectFit="cover"
                quality={75}
                data-ai-hint="doctors team"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutSection;
