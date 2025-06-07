'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { getAboutContent, updateAboutContent, AboutContent } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress'; // Import Progress component

// Define Zod schema for validation
const aboutSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  mission: z.string().min(10, "Mission statement must be at least 10 characters long"),
  vision: z.string().min(10, "Vision statement must be at least 10 characters long"),
  // UPDATED: Image URL validation to accept both absolute URLs and relative paths
  imageUrl: z.string()
    .refine(value => {
      // Empty string is valid (optional image)
      if (!value) return true;
      
      // Valid if it's an absolute URL (http/https)
      if (value.startsWith('http://') || value.startsWith('https://')) return true;
      
      // Valid if it's a relative path from our upload API
      if (value.startsWith('/uploads/')) return true;
      
      // Otherwise invalid
      return false;
    }, { message: "Must be a valid URL (e.g., https://...) or an uploaded image path" })
    .optional(),
  imageHint: z.string().optional(),
});

type AboutFormData = z.infer<typeof aboutSchema>;

export default function ManageAboutPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State for upload status
  const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [currentAboutId, setCurrentAboutId] = useState<string | undefined>(undefined);


  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
        title: '',
        description: '',
        mission: '',
        vision: '',
        imageUrl: '',
        imageHint: '',
    },
  });

  const watchedImageUrl = watch('imageUrl');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAboutContent();
        // Ensure data is not the placeholder before resetting
        if (data && data.id !== 'ac_main_default_placeholder') {
            reset(data);
            setImagePreview(data.imageUrl || undefined);
            setCurrentAboutId(data.id); // Store the actual ID if it exists
        } else {
            // If it's default/placeholder, reset with empty values
            reset({ title: '', description: '', mission: '', vision: '', imageUrl: '', imageHint: '' });
            setImagePreview(undefined);
            setCurrentAboutId(undefined); // No existing ID
        }
      } catch (error) {
        // Error handled within getAboutContent, which returns default
        // Reset with empty values as content likely doesn't exist yet
        reset({ title: '', description: '', mission: '', vision: '', imageUrl: '', imageHint: '' });
        setImagePreview(undefined);
        setCurrentAboutId(undefined);
        toast({
          title: "Info",
          description: "Could not load existing About content. Ready to create new content.",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [reset, toast]);

  // Update preview when imageUrl changes (either by typing or upload)
   useEffect(() => {
     setImagePreview(watchedImageUrl || undefined);
   }, [watchedImageUrl]);

  // --- UPDATED: Handle File Upload --- 
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsUploading(true);
      setUploadProgress(0);
      setImagePreview(undefined); // Clear previous preview
      setValue('imageUrl', '', { shouldValidate: false }); // Clear URL field while uploading

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Use fetch to call the upload API route
        // Assuming the upload route is at /api/upload
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
        setValue('imageUrl', result.url, { shouldValidate: true });
        setImagePreview(result.url);
        setFileName(undefined); // Clear file name display after successful upload
        toast({
          title: "Success",
          description: "Image uploaded successfully.",
        });

      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Upload Error",
          description: error.message || "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        // Clear file input and related state on error
        event.target.value = ''; // Reset file input
        setFileName(undefined);
        setImagePreview(watchedImageUrl || undefined); // Restore preview to previous URL if any
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // If file selection is cancelled or cleared
      setFileName(undefined);
      // Optionally clear the imageUrl if the user clears the file input
      // setValue('imageUrl', '', { shouldValidate: true }); 
      // setImagePreview(undefined);
    }
  };
  // --- End of Update ---

  const onSubmit: SubmitHandler<AboutFormData> = async (data) => {
    setIsSaving(true);
    try {
      // Prepare data, ensuring imageUrl is empty string if undefined/null
      const dataToSave: Partial<Omit<AboutContent, 'created_at'>> & { id?: string } = {
        ...data,
        imageUrl: data.imageUrl || '', // Ensure empty string if undefined
      };

      // Include the ID if we fetched existing content
      if (currentAboutId) {
          dataToSave.id = currentAboutId;
      }

      // Call the API client function (which now handles POST for create/update)
      const updatedContent = await updateAboutContent(dataToSave);
      
      // Reset form with the saved data (including the potentially new ID)
      reset(updatedContent);
      setImagePreview(updatedContent.imageUrl || undefined);
      setCurrentAboutId(updatedContent.id); // Update the ID
      setFileName(undefined); // Clear file name after successful save
      
      toast({
        title: "Success",
        description: "About content saved successfully.",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save About content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <AboutPageSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage About Section</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} disabled={isSaving || isUploading} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={5} disabled={isSaving || isUploading} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          {/* Mission */}
          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Textarea id="mission" {...register("mission")} rows={3} disabled={isSaving || isUploading} />
            {errors.mission && <p className="text-sm text-destructive">{errors.mission.message}</p>}
          </div>

          {/* Vision */}
          <div className="space-y-2">
            <Label htmlFor="vision">Vision</Label>
            <Textarea id="vision" {...register("vision")} rows={3} disabled={isSaving || isUploading} />
            {errors.vision && <p className="text-sm text-destructive">{errors.vision.message}</p>}
          </div>

           {/* Image URL Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input 
              id="imageUrl" 
              {...register("imageUrl")} 
              placeholder="https://example.com/image.jpg or upload below" 
              disabled={isSaving || isUploading} 
              onChange={(e) => {
                // Manually trigger validation and update preview when URL is typed
                setValue("imageUrl", e.target.value, {shouldValidate: true});
                setImagePreview(e.target.value || undefined);
                setFileName(undefined); // Clear file name if URL is typed
              }}
            />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
            <p className="text-xs text-muted-foreground">Enter a full URL (https://...) or use the upload option below.</p>
          </div>
          
          {/* File Upload Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUpload">Or Upload Image</Label>
            <Input 
              id="imageUpload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={isSaving || isUploading} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
            />
            {fileName && !isUploading && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}
            {isUploading && (
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Uploading: {fileName}...</p>
                    <Progress value={uploadProgress} className="w-full h-2" />
                </div>
            )}
          </div>

           {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="relative h-40 w-full max-w-md rounded border overflow-hidden bg-muted">
                    <Image
                     src={imagePreview} // Use the state variable for preview
                     alt="About section image preview"
                     fill={true} // Use fill instead of layout="fill"
                     style={{ objectFit: 'cover' }} // Use style for objectFit
                     unoptimized // Good for external URLs that might change, prevents Next.js optimization
                     onError={() => {
                         // Handle broken image links
                         console.warn(`Failed to load image preview: ${imagePreview}`);
                         setImagePreview(undefined); // Clear preview on error
                         // Optionally clear the form value too if the URL is invalid
                         // setValue('imageUrl', '', { shouldValidate: true });
                     }}
                    />
                </div>
            </div>
          )}

           {/* Image AI Hint */}
           <div className="space-y-2">
            <Label htmlFor="imageHint">Image AI Hint (Optional)</Label>
            <Input id="imageHint" {...register("imageHint")} placeholder="e.g., doctors team" disabled={isSaving || isUploading} />
            <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.imageHint && <p className="text-sm text-destructive">{errors.imageHint.message}</p>}
          </div>

        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? 'Saving...' : (isUploading ? 'Uploading...' : 'Save Changes')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


const AboutPageSkeleton = () => (
  <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-6">
         <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
         </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
         </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
         </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-16 w-full" />
         </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
         </div>
         <div className="space-y-2">
             <Skeleton className="h-4 w-28" />
             <Skeleton className="h-10 w-full" />
         </div>
         <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
             <Skeleton className="h-40 w-full max-w-md" />
         </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
         </div>
      </CardContent>
      <CardFooter>
         <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
);