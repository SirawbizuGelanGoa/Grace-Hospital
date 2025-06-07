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
import { getSiteSettings, updateSiteSettings, SiteSettingsSQL } from '@/lib/mock-data'; // Ensure this uses mock-data
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Facebook, Send } from 'lucide-react';
import { TikTokIcon } from '@/components/tiktok-icon';
import { Progress } from '@/components/ui/progress'; // Import Progress component

// Define Zod schema for validation (matches SiteSettingsSQL)
const siteSettingsSchema = z.object({
  hospitalName: z.string().min(3, "Hospital name must be at least 3 characters long"),
  logoUrl: z.string().optional().or(z.literal(''))
    .refine(value => {
      // Empty string is valid (optional image)
      if (!value) return true;
      
      // Valid if it's an absolute URL (http/https)
      if (value.startsWith('http://') || value.startsWith('https://')) return true;
      
      // Valid if it's a relative path from our upload API
      if (value.startsWith('/uploads/')) return true;
      
      // Otherwise invalid
      return false;
    }, { message: "Must be a valid URL (e.g., https://...) or an uploaded image path" }),
  facebookUrl: z.string().url("Invalid Facebook URL").optional().or(z.literal('')),
  tiktokUrl: z.string().url("Invalid TikTok URL").optional().or(z.literal('')),
  telegramUrl: z.string().url("Invalid Telegram URL").optional().or(z.literal('')),
});

type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;


export default function ManageSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State for upload status
  const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const [logoFileName, setLogoFileName] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
        hospitalName: '',
        logoUrl: '',
        facebookUrl: '',
        tiktokUrl: '',
        telegramUrl: '',
    },
  });

  const watchedLogoUrl = watch('logoUrl');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getSiteSettings(); // Uses mock-data
        if (data) {
          reset({
            hospitalName: data.hospitalName,
            logoUrl: data.logoUrl || '',
            facebookUrl: data.facebookUrl || '',
            tiktokUrl: data.tiktokUrl || '',
            telegramUrl: data.telegramUrl || '',
          });
          setLogoPreview(data.logoUrl || undefined);
        } else {
            reset({ 
                hospitalName: 'Grace Hospital', 
                logoUrl: '',
                facebookUrl: '',
                tiktokUrl: '',
                telegramUrl: '',
            });
            setLogoPreview(undefined);
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
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
    setLogoPreview(watchedLogoUrl || undefined);
  }, [watchedLogoUrl]);

  // --- UPDATED: Handle File Upload --- 
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      setIsUploading(true);
      setUploadProgress(0);
      setLogoPreview(undefined); // Clear previous preview
      setValue('logoUrl', '', { shouldValidate: false }); // Clear URL field while uploading

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Use fetch to call the upload API route
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          // Note: Don't set Content-Type header, browser does it for FormData
        });

        // Simulate progress (replace with actual progress if backend supports it)
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(Math.min(progress, 90)); // Stop at 90 until fetch completes
            if (progress >= 90) clearInterval(interval);
        }, 100);

        const result = await response.json();
        clearInterval(interval); // Clear simulation interval
        setUploadProgress(100); // Set progress to 100

        if (!response.ok) {
          throw new Error(result.message || 'Upload failed');
        }

        // Update the form with the returned URL
        setValue('logoUrl', result.url, { shouldValidate: true });
        setLogoPreview(result.url);
        setLogoFileName(undefined); // Clear file name display after successful upload
        toast({
          title: "Success",
          description: "Logo uploaded successfully.",
        });

      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Upload Error",
          description: error.message || "Failed to upload logo. Please try again.",
          variant: "destructive",
        });
        // Clear file input and related state on error
        event.target.value = ''; // Reset file input
        setLogoFileName(undefined);
        setLogoPreview(watchedLogoUrl || undefined); // Restore preview to previous URL if any
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // If file selection is cancelled or cleared
      setLogoFileName(undefined);
    }
  };
  // --- End of Update ---

  const onSubmit: SubmitHandler<SiteSettingsFormData> = async (data) => {
    setIsSaving(true);
    try {
      const dataToSave: SiteSettingsSQL = {
          ...data,
          id: 'ss_main', // Assuming a fixed ID for site settings
          logoUrl: data.logoUrl || null,
          facebookUrl: data.facebookUrl || null,
          tiktokUrl: data.tiktokUrl || null,
          telegramUrl: data.telegramUrl || null,
      };
      const updatedSettings = await updateSiteSettings(dataToSave); // Uses mock-data
      if (updatedSettings) {
        reset({ 
            hospitalName: updatedSettings.hospitalName,
            logoUrl: updatedSettings.logoUrl || '',
            facebookUrl: updatedSettings.facebookUrl || '',
            tiktokUrl: updatedSettings.tiktokUrl || '',
            telegramUrl: updatedSettings.telegramUrl || '',
        });
        setLogoPreview(updatedSettings.logoUrl || undefined);
      }
      setLogoFileName(undefined);
      toast({
        title: "Success",
        description: "Site settings updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save site settings:', error);
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
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-24 w-24" /> 
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
        <CardDescription>Update general website settings like hospital name, logo, and social media links.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital Name</Label>
            <Input id="hospitalName" {...register("hospitalName")} disabled={isSaving || isUploading} placeholder="Enter hospital name" />
            {errors.hospitalName && <p className="text-sm text-destructive">{errors.hospitalName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrlField">Logo Image URL (Optional)</Label>
            <Input 
              id="logoUrlField" 
              {...register("logoUrl")} 
              placeholder="https://example.com/logo.png or upload below" 
              disabled={isSaving || isUploading} 
              onChange={(e) => {
                setValue("logoUrl", e.target.value, {shouldValidate: true});
                setLogoPreview(e.target.value || undefined);
                setLogoFileName(undefined); 
              }}
            />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
            <p className="text-xs text-muted-foreground">Enter a full URL (https://...) or use the upload option below.</p>
          </div>

          {/* File Upload Input */}
          <div className="space-y-2">
            <Label htmlFor="logoUpload">Or Upload Logo</Label>
            <Input 
              id="logoUpload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={isSaving || isUploading} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
            />
            {logoFileName && !isUploading && <p className="text-sm text-muted-foreground">Selected file: {logoFileName}</p>}
            {isUploading && (
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Uploading: {logoFileName}...</p>
                    <Progress value={uploadProgress} className="w-full h-2" />
                </div>
            )}
          </div>

          {logoPreview && (
            <div className="space-y-2">
                <Label>Logo Preview</Label>
                <div className="relative h-24 w-24 rounded border overflow-hidden bg-muted p-1">
                    <Image
                     src={logoPreview}
                     alt="Logo preview"
                     fill={true} // Use fill instead of layout="fill"
                     style={{ objectFit: 'contain' }} // Use style for objectFit
                     unoptimized 
                     onError={() => {
                         // Handle broken image links
                         console.warn(`Failed to load image preview: ${logoPreview}`);
                         setLogoPreview(undefined); // Clear preview on error
                     }}
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

            <div className="space-y-2">
                <Label htmlFor="facebookUrl" className="flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-600" /> Facebook URL</Label>
                <Input id="facebookUrl" {...register("facebookUrl")} placeholder="https://facebook.com/yourpage" disabled={isSaving || isUploading} />
                {errors.facebookUrl && <p className="text-sm text-destructive">{errors.facebookUrl.message}</p>}
            </div>
            <div className="space-y-2">
                 <Label htmlFor="tiktokUrl" className="flex items-center gap-2"><TikTokIcon className="h-4 w-4 text-black" /> TikTok URL</Label>
                <Input id="tiktokUrl" {...register("tiktokUrl")} placeholder="https://tiktok.com/@yourprofile" disabled={isSaving || isUploading} />
                {errors.tiktokUrl && <p className="text-sm text-destructive">{errors.tiktokUrl.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="telegramUrl" className="flex items-center gap-2"><Send className="h-4 w-4 text-sky-500" /> Telegram URL</Label>
                <Input id="telegramUrl" {...register("telegramUrl")} placeholder="https://t.me/yourchannel" disabled={isSaving || isUploading} />
                {errors.telegramUrl && <p className="text-sm text-destructive">{errors.telegramUrl.message}</p>}
            </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? 'Saving...' : (isUploading ? 'Uploading...' : 'Save Settings')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

