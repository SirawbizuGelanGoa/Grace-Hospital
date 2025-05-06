import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Info, Wrench, Building2, Image as ImageIcon, Newspaper, Phone } from 'lucide-react'; // Use specific icons


// Placeholder: Fetch dynamic stats if needed (e.g., number of items)
const getAdminStats = async () => {
  // Simulate fetching stats
  await new Promise(resolve => setTimeout(resolve, 50));
  return {
    servicesCount: 6, // Example static count
    galleryItemsCount: 8,
    newsCount: 3,
  };
};


export default async function AdminPage() {
    const stats = await getAdminStats();

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
             <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
             {/* Button to view site is now in sidebar footer */}
         </div>


      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the sidebar navigation to manage different sections of the website content.
          </p>
           <p className="text-muted-foreground mt-4">
            Current Content Overview (Example):
          </p>
           <ul className="list-disc list-inside text-muted-foreground mt-2 text-sm space-y-1">
             <li>Services: {stats.servicesCount} items</li>
             <li>Gallery: {stats.galleryItemsCount} items</li>
             <li>News & Events: {stats.newsCount} items</li>
             {/* Add more stats as needed */}
           </ul>
        </CardContent>
      </Card>

       {/* Quick Access Links (Optional - could be removed if sidebar is sufficient) */}
       <div className="mt-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">Quick Management Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Example Quick Access Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                         <CardTitle className="text-base font-medium">Manage Services</CardTitle>
                         <Wrench className="h-5 w-5 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        <p className="text-xs text-muted-foreground mb-3">Add, edit, or delete hospital services.</p>
                         <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/manage/services">Go to Services</Link>
                        </Button>
                     </CardContent>
                </Card>

                 <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                         <CardTitle className="text-base font-medium">Manage Gallery</CardTitle>
                         <ImageIcon className="h-5 w-5 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                         <p className="text-xs text-muted-foreground mb-3">Upload or remove photos and videos.</p>
                         <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/manage/gallery">Go to Gallery</Link>
                         </Button>
                     </CardContent>
                </Card>

                 <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                         <CardTitle className="text-base font-medium">Manage News</CardTitle>
                         <Newspaper className="h-5 w-5 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                         <p className="text-xs text-muted-foreground mb-3">Create or update news and event posts.</p>
                         <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/manage/news">Go to News</Link>
                         </Button>
                     </CardContent>
                </Card>

                 {/* Add cards for other sections if desired (About, Facilities, Depts, Contact) */}

            </div>
        </div>


    </div>
  );
}
