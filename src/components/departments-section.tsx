import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HeartPulse, Brain, Bone, Baby, Stethoscope, ShieldCheck } from 'lucide-react'; // Example icons

const DepartmentsSection = () => {
  // In a real app, fetch this data from the database
  const departments = [
    { id: 1, name: 'Cardiology', description: 'Specializing in heart and vascular system disorders. We offer advanced diagnostics, treatments, and preventive care.', icon: HeartPulse },
    { id: 2, name: 'Neurology', description: 'Focused on the diagnosis and treatment of nervous system disorders, including the brain, spinal cord, and nerves.', icon: Brain },
    { id: 3, name: 'Orthopedics', description: 'Providing comprehensive care for musculoskeletal conditions, including bones, joints, ligaments, tendons, and muscles.', icon: Bone },
    { id: 4, name: 'Pediatrics', description: 'Dedicated to the medical care of infants, children, and adolescents.', icon: Baby },
    { id: 5, name: 'General Surgery', description: 'Offering a wide range of surgical procedures performed by experienced surgeons using modern techniques.', icon: Stethoscope }, // Stethoscope is placeholder, consider a scalpel SVG if needed
    { id: 6, name: 'Oncology', description: 'Comprehensive cancer care including diagnosis, treatment, and support services.', icon: ShieldCheck }, // Placeholder icon
  ];

  return (
    <section id="departments" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Departments</h2>
        <Accordion type="single" collapsible className="w-full md:w-3/4 lg:w-2/3 mx-auto">
          {departments.map((dept) => (
            <AccordionItem value={`item-${dept.id}`} key={dept.id} className="border border-border rounded-lg mb-4 shadow-sm overflow-hidden">
              <AccordionTrigger className="bg-secondary hover:bg-muted px-6 py-4 text-left text-lg font-semibold text-secondary-foreground [&[data-state=open]>svg]:text-primary">
                <div className="flex items-center gap-4">
                   <dept.icon className="h-6 w-6 text-primary shrink-0" />
                  {dept.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-muted-foreground bg-white">
                {dept.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default DepartmentsSection;
