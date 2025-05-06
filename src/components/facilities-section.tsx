import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, FlaskConical, Monitor, Stethoscope, Syringe } from 'lucide-react'; // Replaced MonitorHeart with Monitor

const FacilitiesSection = () => {
  // In a real app, fetch this data from the database
  const facilities = [
    { id: 1, name: 'Modern Patient Rooms', description: 'Comfortable and well-equipped private and semi-private rooms.', icon: BedDouble },
    { id: 2, name: 'Advanced Laboratory', description: 'State-of-the-art diagnostic testing facilities.', icon: FlaskConical },
    { id: 3, name: 'Intensive Care Unit (ICU)', description: 'Specialized care for critically ill patients with continuous monitoring.', icon: Monitor }, // Updated icon
    { id: 4, name: 'Outpatient Clinics', description: 'Convenient access to specialist consultations and follow-ups.', icon: Stethoscope },
    { id: 5, name: 'Emergency Department', description: '24/7 emergency care services with experienced staff.', icon: Syringe }, // Note: Syringe might not be the best, consider Ambulance or AlertTriangle
  ];

  return (
    <section id="facilities" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility) => (
            <Card key={facility.id} className="shadow-lg flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                 <div className="bg-accent text-accent-foreground rounded-full p-3">
                   <facility.icon className="h-6 w-6" />
                 </div>
                <CardTitle className="text-lg font-semibold text-primary">{facility.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{facility.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
