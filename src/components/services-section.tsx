import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, HeartPulse, Brain, Bone, Baby, Microscope } from 'lucide-react'; // Example icons

const ServicesSection = () => {
  // In a real app, fetch this data from the database
  const services = [
    { id: 1, name: 'General Medicine', description: 'Comprehensive care for adults and children.', icon: Stethoscope },
    { id: 2, name: 'Cardiology', description: 'Expert heart care and diagnostics.', icon: HeartPulse },
    { id: 3, name: 'Neurology', description: 'Specialized treatment for brain and nerve disorders.', icon: Brain },
    { id: 4, name: 'Orthopedics', description: 'Advanced care for bones and joints.', icon: Bone },
    { id: 5, name: 'Pediatrics', description: 'Dedicated healthcare for infants and children.', icon: Baby },
    { id: 6, name: 'Laboratory Services', description: 'Accurate diagnostic testing.', icon: Microscope },
  ];

  return (
    <section id="services" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-4">
                   <service.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-semibold text-primary">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
