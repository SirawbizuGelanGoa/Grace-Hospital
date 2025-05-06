import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import DynamicIcon from "@/lib/icons"; // Import the dynamic icon component
import { getDepartments } from '@/lib/mock-data'; // Import data fetching function

const DepartmentsSection = async () => {
  // Fetch departments data from the mock source
  const departments = await getDepartments();

  return (
    <section id="departments" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Departments</h2>
        <Accordion type="single" collapsible className="w-full md:w-3/4 lg:w-2/3 mx-auto">
          {departments.map((dept) => (
            <AccordionItem value={`item-${dept.id}`} key={dept.id} className="border border-border rounded-lg mb-4 shadow-sm overflow-hidden">
              <AccordionTrigger className="bg-secondary hover:bg-muted px-6 py-4 text-left text-lg font-semibold text-secondary-foreground [&[data-state=open]>svg]:text-primary">
                <div className="flex items-center gap-4">
                   {/* Use DynamicIcon component */}
                   <DynamicIcon name={dept.iconName} className="h-6 w-6 text-primary shrink-0" />
                  {dept.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 text-muted-foreground bg-white">
                {dept.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {departments.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">No departments listed at this time.</p>
        )}
      </div>
    </section>
  );
};

export default DepartmentsSection;
