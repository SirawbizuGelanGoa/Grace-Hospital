import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
        <Button variant="outline" asChild>
           <Link href="/">Back to Site</Link>
         </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is the main admin dashboard. Functionality for managing website content (About, Services, Facilities, Departments, Gallery, News, Contact) will be implemented here.
          </p>
          <p className="text-muted-foreground mt-4">
            Features to be added:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2">
            <li>Secure Login/Authentication</li>
            <li>CRUD operations for each section</li>
            <li>Media upload management (Images/Videos)</li>
            <li>Dynamic data loading from MySQL database</li>
          </ul>
        </CardContent>
      </Card>

       {/* Placeholder links/sections for CRUD operations */}
       <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {['About', 'Services', 'Facilities', 'Departments', 'Gallery', 'News & Events', 'Contact Info'].map(section => (
           <Card key={section}>
             <CardHeader>
               <CardTitle>Manage {section}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm text-muted-foreground mb-4">Add, edit, or delete content for the {section} section.</p>
               <Button variant="accent" disabled>Manage {section}</Button>
             </CardContent>
           </Card>
         ))}
       </div>
    </div>
  );
}
