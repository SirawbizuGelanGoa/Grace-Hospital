'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { getContactInfo, updateContactInfo, ContactInfo } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, Mail } from 'lucide-react';

// Define Zod schema for validation
const contactSchema = z.object({
  address: z.string().min(10, "Address must be at least 10 characters long"),
  phone: z.string().min(10, "Phone number must be at least 10 characters").regex(/^[\d\s()+-]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  mapPlaceholder: z.string().optional(), // Or use z.string().url() if expecting a map embed URL
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ManageContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
        address: '',
        phone: '',
        email: '',
        mapPlaceholder: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getContactInfo();
        reset(data); // Populate form with fetched data
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load Contact information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [reset, toast]);


  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSaving(true);
    try {
      const updatedInfo = await updateContactInfo(data);
       reset(updatedInfo); // Reset form with saved data to reflect changes
      toast({
        title: "Success",
        description: "Contact information updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contact information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ContactPageSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Contact Information</CardTitle>
         <CardDescription>Update the address, phone, email, and map details displayed on the site.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address"><MapPin className="inline-block h-4 w-4 mr-1 mb-0.5"/> Address</Label>
            <Textarea id="address" {...register("address")} rows={3} disabled={isSaving} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone"><Phone className="inline-block h-4 w-4 mr-1 mb-0.5"/> Phone Number</Label>
            <Input id="phone" {...register("phone")} type="tel" disabled={isSaving} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email"><Mail className="inline-block h-4 w-4 mr-1 mb-0.5"/> Email Address</Label>
            <Input id="email" {...register("email")} type="email" disabled={isSaving} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Map Placeholder / Embed URL */}
          <div className="space-y-2">
            <Label htmlFor="mapPlaceholder">Map Placeholder Text or Embed URL (Optional)</Label>
            <Input id="mapPlaceholder" {...register("mapPlaceholder")} placeholder="e.g., Map Coming Soon or https://maps.google.com/..." disabled={isSaving} />
             <p className="text-xs text-muted-foreground">Enter text to display or a full URL for an embedded map (requires frontend changes to render).</p>
            {errors.mapPlaceholder && <p className="text-sm text-destructive">{errors.mapPlaceholder.message}</p>}
          </div>

        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


const ContactPageSkeleton = () => (
  <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
         <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
         <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
         </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
         </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
         </div>
           <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
         </div>
      </CardContent>
      <CardFooter>
         <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
);
