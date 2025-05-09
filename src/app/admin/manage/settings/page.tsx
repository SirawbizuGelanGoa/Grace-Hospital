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
  logoUrl: z.string().optional().or(z.literal('')).refine(value => {
    if (!value) return true; // Allow empty or undefined
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image');
  }, { message: "Must be a valid URL or an uploaded image." }),
});

type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

export default function ManageSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const [logoFileName, setLogoFileName] = useState<string | undefined>(undefined);


  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
        hospitalName: '',
        logoUrl: '',
    },
  });

  const watchedLogoUrl = watch('logoUrl');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getSiteSettings();
        reset(data);
        setLogoPreview(data.logoUrl);
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
    setLogoPreview(watchedLogoUrl);
  }, [watchedLogoUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue('logoUrl', dataUri, { shouldValidate: true });
        setLogoPreview(dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFileName(undefined);
      // Optionally clear 'logoUrl' if file is removed, or let user clear URL field
    }
  };

  const onSubmit: SubmitHandler<SiteSettingsFormData> = async (data) => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...data,
        logoUrl: data.logoUrl || '', // Ensure empty string if undefined
      };
      const updatedSettings = await updateSiteSettings(dataToSave);
      reset(updatedSettings); 
      setLogoPreview(updatedSettings.logoUrl);
      setLogoFileName(undefined); // Clear file name after successful save
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

          {/* Logo URL Input */}
          <div className="space-y-2">
            <Label htmlFor="logoUrlField">Logo Image URL (Optional)</Label>
            <Input 
              id="logoUrlField" 
              {...register("logoUrl")} 
              placeholder="https://example.com/logo.png or leave blank to upload" 
              disabled={isSaving} 
              onChange={(e) => {
                setValue("logoUrl", e.target.value, {shouldValidate: true});
                setLogoPreview(e.target.value);
                setLogoFileName(undefined); // Clear file name if URL is typed
              }}
            />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
          </div>

           {/* Logo File Upload Input */}
           <div className="space-y-2">
            <Label htmlFor="logoUpload">Or Upload Logo</Label>
            <Input 
              id="logoUpload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={isSaving} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {logoFileName && <p className="text-sm text-muted-foreground">Selected file: {logoFileName}</p>}
            <p className="text-xs text-muted-foreground">Upload a logo image. URLs will take precedence if both are provided.</p>
          </div>


          {/* Logo Preview */}
          {logoPreview && (
            <div className="space-y-2">
                <Label>Logo Preview</Label>
                <div className="relative h-24 w-24 rounded border overflow-hidden bg-muted p-1">
                    <Image
                     src={logoPreview}
                     alt="Logo preview"
                     layout="fill"
                     objectFit="contain"
                     unoptimized 
                    />
                </div>
            </div>
          )}
           {!logoPreview && !isLoading && (
             <div className="space-y-2">
                <Label>Logo Preview</Label>
                 <div className="h-24 w-24 rounded border bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    No logo
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
