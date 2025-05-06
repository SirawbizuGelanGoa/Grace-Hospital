import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DynamicIcon from "@/lib/icons"; // Import the dynamic icon component
import { getFacilities } from '@/lib/mock-data'; // Import data fetching function

const FacilitiesSection = async () => {
  // Fetch facilities data from the mock source
  const facilities = await getFacilities();

  return (
    <section id="facilities" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility) => (
            <Card key={facility.id} className="shadow-lg flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                 <div className="bg-accent text-accent-foreground rounded-full p-3">
                   {/* Use DynamicIcon component */}
                   <DynamicIcon name={facility.iconName} className="h-6 w-6" />
                 </div>
                <CardTitle className="text-lg font-semibold text-primary">{facility.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{facility.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
         {facilities.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">No facilities listed at this time.</p>
        )}
      </div>
    </section>
  );
};

export default FacilitiesSection;
