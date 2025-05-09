import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import DynamicIcon from "@/lib/icons"; 
import { getDepartments } from '@/lib/mock-data'; 
import NextImage from 'next/image';

const DepartmentsSection = async () => {
  const departments = await getDepartments();

  return (
    <section id="departments" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Departments</h2>
        {departments.length > 0 ? (
          <Accordion type="single" collapsible className="w-full md:w-3/4 lg:w-2/3 mx-auto">
            {departments.map((dept) => (
              <AccordionItem value={`item-${dept.id}`} key={dept.id} className="border border-border rounded-lg mb-4 shadow-sm overflow-hidden">
                <AccordionTrigger className="bg-secondary hover:bg-muted px-6 py-4 text-left text-lg font-semibold text-secondary-foreground [&[data-state=open]>svg]:text-primary">
                  <div className="flex items-center gap-4">
                    <DynamicIcon name={dept.iconName} className="h-6 w-6 text-primary shrink-0" />
                    {dept.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 text-muted-foreground bg-white">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {dept.headOfDepartmentImage && (
                      <div className="relative w-full md:w-1/3 aspect-square rounded-lg overflow-hidden shadow-md shrink-0">
                        <NextImage
                          src={dept.headOfDepartmentImage}
                          alt={`Head of ${dept.name} Department`}
                          layout="fill"
                          objectFit="cover"
                          quality={75}
                          data-ai-hint={dept.headOfDepartmentImageHint || 'department head'}
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h4 className="text-lg font-semibold text-primary mb-2">About the {dept.name} Department</h4>
                      <p className="whitespace-pre-wrap">{dept.detailedDescription}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-muted-foreground mt-8">No departments listed at this time.</p>
        )}
      </div>
    </section>
  );
};

export default DepartmentsSection;
