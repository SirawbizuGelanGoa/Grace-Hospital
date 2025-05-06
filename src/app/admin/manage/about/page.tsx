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
  imageUrl: z.string().url("Image URL must be a valid URL").optional().or(z.literal('')), // Optional and allows empty string
  imageHint: z.string().optional(),
});

type AboutFormData = z.infer<typeof aboutSchema>;

export default function ManageAboutPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: { // Ensure default values match the schema
        title: '',
        description: '',
        mission: '',
        vision: '',
        imageUrl: '',
        imageHint: '',
    },
  });

  const imageUrl = watch('imageUrl'); // Watch the imageUrl field for preview

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAboutContent();
        reset(data); // Populate form with fetched data
        setCurrentImageUrl(data.imageUrl); // Set initial image URL for preview
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
     // Update preview URL when form value changes
     setCurrentImageUrl(imageUrl);
   }, [imageUrl]);


  const onSubmit: SubmitHandler<AboutFormData> = async (data) => {
    setIsSaving(true);
    try {
      const updatedContent = await updateAboutContent(data);
       reset(updatedContent); // Reset form with saved data to reflect changes
       setCurrentImageUrl(updatedContent.imageUrl); // Update preview
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

           {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input id="imageUrl" {...register("imageUrl")} placeholder="https://example.com/image.jpg" disabled={isSaving} />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
          </div>

           {/* Image Preview */}
          {currentImageUrl && (
            <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="relative h-40 w-full max-w-md rounded border overflow-hidden">
                    <Image
                     src={currentImageUrl}
                     alt="About section image preview"
                     layout="fill"
                     objectFit="cover"
                     unoptimized // Good for external URLs that might change
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
