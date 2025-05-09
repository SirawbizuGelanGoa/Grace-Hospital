import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DynamicIcon from "@/lib/icons"; 
import { getServices } from '@/lib/mock-data'; 

const ServicesSection = async () => {
  const services = await getServices();

  return (
    <section id="services" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="group text-center shadow-lg transition-shadow duration-300 [perspective:1000px] min-h-[320px] rounded-xl"
            >
              <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180 rounded-xl">
                {/* Front Face */}
                <div className="absolute inset-0 w-full h-full backface-hidden flex flex-col bg-card rounded-xl">
                  <CardHeader className="items-center text-center pt-6">
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-4">
                       <DynamicIcon name={service.iconName} className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-primary">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-center justify-center px-4 pb-6">
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardContent>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-primary text-primary-foreground p-4 flex flex-col items-center justify-start rounded-xl shadow-lg">
                  <CardHeader className="items-center text-center pt-4 pb-2">
                    <div className="mx-auto bg-primary-foreground text-primary rounded-full p-3 w-fit mb-2">
                        <DynamicIcon name={service.iconName} className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-primary-foreground">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center overflow-y-auto flex-grow w-full scrollbar-thin scrollbar-thumb-primary-foreground/50 scrollbar-track-transparent px-2 pb-4">
                    <p className="text-sm">{service.detailedDescription}</p>
                  </CardContent>
                </div>
              </div>
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
