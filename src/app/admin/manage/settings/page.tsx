'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image'; // For logo preview

// Define Zod schema for validation
const siteSettingsSchema = z.object({
  hospitalName: z.string().min(3, "Hospital name must be at least 3 characters long"),
  logoUrl: z.string().url("Logo URL must be a valid URL (e.g., https://...)").optional().or(z.literal('')),
});

type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

export default function ManageSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
        hospitalName: '',
        logoUrl: '',
    },
  });

  const logoUrlField = watch('logoUrl'); // Watch the logoUrl field for preview

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getSiteSettings();
        reset(data); // Populate form with fetched data
        setCurrentLogoUrl(data.logoUrl); // Set initial logo URL for preview
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load site settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [reset, toast]);

  useEffect(() => {
    // Update preview URL when form value changes
    setCurrentLogoUrl(logoUrlField);
  }, [logoUrlField]);


  const onSubmit: SubmitHandler<SiteSettingsFormData> = async (data) => {
    setIsSaving(true);
    try {
      const updatedSettings = await updateSiteSettings(data);
      reset(updatedSettings); // Reset form with saved data to reflect changes
      setCurrentLogoUrl(updatedSettings.logoUrl); // Update preview
      toast({
        title: "Success",
        description: "Site settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save site settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-24 w-24" /> {/* Logo preview skeleton */}
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Site Settings</CardTitle>
        <CardDescription>Update general website settings like hospital name and logo.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Hospital Name */}
          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital Name</Label>
            <Input id="hospitalName" {...register("hospitalName")} disabled={isSaving} placeholder="Enter hospital name" />
            {errors.hospitalName && <p className="text-sm text-destructive">{errors.hospitalName.message}</p>}
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo Image URL (Optional)</Label>
            <Input id="logoUrl" {...register("logoUrl")} placeholder="https://example.com/logo.png" disabled={isSaving} />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
             <p className="text-xs text-muted-foreground">Provide a direct URL to the logo image.</p>
          </div>

          {/* Logo Preview */}
          {currentLogoUrl && (
            <div className="space-y-2">
                <Label>Logo Preview</Label>
                <div className="relative h-24 w-24 rounded border overflow-hidden bg-muted p-1">
                    <Image
                     src={currentLogoUrl}
                     alt="Logo preview"
                     layout="fill"
                     objectFit="contain" // Use contain to see the whole logo
                     unoptimized 
                    />
                </div>
            </div>
          )}
           {!currentLogoUrl && !isLoading && (
             <div className="space-y-2">
                <Label>Logo Preview</Label>
                 <div className="h-24 w-24 rounded border bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    No logo URL
                 </div>
            </div>
           )}

        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
