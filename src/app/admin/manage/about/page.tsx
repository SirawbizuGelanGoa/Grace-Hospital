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
import Image from 'next/image'; // Import Image component

// Define Zod schema for validation
const aboutSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  mission: z.string().min(10, "Mission statement must be at least 10 characters long"),
  vision: z.string().min(10, "Vision statement must be at least 10 characters long"),
  imageUrl: z.string().optional().or(z.literal('')).refine(value => {
    if (!value) return true; // Allow empty or undefined
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image');
  }, { message: "Must be a valid URL or an uploaded image." }),
  imageHint: z.string().optional(),
});

type AboutFormData = z.infer<typeof aboutSchema>;

export default function ManageAboutPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);


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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAboutContent();
        reset(data);
        setImagePreview(data.imageUrl);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load About content.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [reset, toast]);

   useEffect(() => {
     setImagePreview(watchedImageUrl);
   }, [watchedImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue('imageUrl', dataUri, { shouldValidate: true });
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(undefined);
      // If file is removed, clear the imageUrl if it was a data URI, or leave it if it's an external URL
      // For simplicity, we might let the user clear the URL field manually or re-upload
    }
  };

  const onSubmit: SubmitHandler<AboutFormData> = async (data) => {
    setIsSaving(true);
    try {
      // Ensure imageUrl is either a valid URL or data URI, or empty
      const dataToSave = {
        ...data,
        imageUrl: data.imageUrl || '', // Ensure empty string if undefined
      };
      const updatedContent = await updateAboutContent(dataToSave);
       reset(updatedContent); 
       setImagePreview(updatedContent.imageUrl);
       setFileName(undefined); // Clear file name after successful save
      toast({
        title: "Success",
        description: "About content updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save About content. Please try again.",
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
            <Input id="title" {...register("title")} disabled={isSaving} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={5} disabled={isSaving} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          {/* Mission */}
          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Textarea id="mission" {...register("mission")} rows={3} disabled={isSaving} />
            {errors.mission && <p className="text-sm text-destructive">{errors.mission.message}</p>}
          </div>

          {/* Vision */}
          <div className="space-y-2">
            <Label htmlFor="vision">Vision</Label>
            <Textarea id="vision" {...register("vision")} rows={3} disabled={isSaving} />
            {errors.vision && <p className="text-sm text-destructive">{errors.vision.message}</p>}
          </div>

           {/* Image URL Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input 
              id="imageUrl" 
              {...register("imageUrl")} 
              placeholder="https://example.com/image.jpg or leave blank to upload" 
              disabled={isSaving} 
              onChange={(e) => {
                setValue("imageUrl", e.target.value, {shouldValidate: true});
                setImagePreview(e.target.value);
                setFileName(undefined); // Clear file name if URL is typed
              }}
            />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
          </div>
          
          {/* File Upload Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUpload">Or Upload Image</Label>
            <Input 
              id="imageUpload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={isSaving} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {fileName && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}
          </div>


           {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="relative h-40 w-full max-w-md rounded border overflow-hidden">
                    <Image
                     src={imagePreview}
                     alt="About section image preview"
                     layout="fill"
                     objectFit="cover"
                     unoptimized // Good for external URLs and data URIs that might change
                    />
                </div>
            </div>
          )}


           {/* Image AI Hint */}
           <div className="space-y-2">
            <Label htmlFor="imageHint">Image AI Hint (Optional)</Label>
            <Input id="imageHint" {...register("imageHint")} placeholder="e.g., doctors team" disabled={isSaving} />
            <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.imageHint && <p className="text-sm text-destructive">{errors.imageHint.message}</p>}
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
