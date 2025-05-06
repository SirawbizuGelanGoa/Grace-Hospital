import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DynamicIcon from "@/lib/icons"; // Import the dynamic icon component
import { getServices } from '@/lib/mock-data'; // Import data fetching function

const ServicesSection = async () => {
  // Fetch services data from the mock source
  const services = await getServices();

  return (
    <section id="services" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-4">
                   {/* Use DynamicIcon component */}
                   <DynamicIcon name={service.iconName} className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-semibold text-primary">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {services.length === 0 && (
           <p className="text-center text-muted-foreground mt-8">No services listed at this time.</p>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
