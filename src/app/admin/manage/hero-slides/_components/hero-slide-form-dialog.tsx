'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { createHeroSlide, updateHeroSlide, HeroSlide } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

// Define Zod schema for validation
const heroSlideSchema = z.object({
  src: z.string().min(1, "Image source is required.").refine(value => {
    // Valid if it's an absolute URL (http/https)
    if (value.startsWith('http://') || value.startsWith('https://')) return true;
    
    // Valid if it's a relative path from our upload API
    if (value.startsWith('/uploads/')) return true;
    
    // Otherwise invalid
    return false;
  }, { message: "Must be a valid URL (e.g., https://...) or an uploaded image path" }),
  alt: z.string().min(5, "Alternative text must be at least 5 characters long"),
  hint: z.string().max(50, "AI hint should be concise (max 50 chars)").optional(),
  title: z.string().max(100, "Title cannot exceed 100 characters").optional(),
  subtitle: z.string().max(200, "Subtitle cannot exceed 200 characters").optional(),
  // Modified validation for ctaLink to allow hash links
  ctaLink: z.string().refine(value => {
    // Empty string is valid (optional field)
    if (value === '') return true;
    
    // Valid if it's an absolute URL (http/https)
    if (value.startsWith('http://') || value.startsWith('https://')) return true;
    
    // Valid if it's a relative path
    if (value.startsWith('/')) return true;
    
    // Valid if it's a hash link
    if (value.startsWith('#')) return true;
    
    // Otherwise invalid
    return false;
  }, { message: "Must be a valid URL, relative path (/page), or hash link (#section)" }).optional().or(z.literal('')),
  ctaText: z.string().max(30, "CTA Text cannot exceed 30 characters").optional(),
});

type HeroSlideFormData = z.infer<typeof heroSlideSchema>;

interface HeroSlideFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  slide: HeroSlide | null;
  onSuccess: (slide: HeroSlide) => void;
}

export default function HeroSlideFormDialog({ isOpen, setIsOpen, slide, onSuccess }: HeroSlideFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isEditing = !!slide;
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<HeroSlideFormData>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: {
      src: '',
      alt: '',
      hint: '',
      title: '',
      subtitle: '',
      ctaLink: '',
      ctaText: '',
    }
  });

  const watchedSrc = watch('src');

  useEffect(() => {
    if (isOpen) {
      if (slide) {
        reset({
          src: slide.src,
          alt: slide.alt,
          hint: slide.hint || '',
          title: slide.title || '',
          subtitle: slide.subtitle || '',
          ctaLink: slide.ctaLink || '',
          ctaText: slide.ctaText || '',
        });
        setImagePreview(slide.src);
      } else {
        reset({
          src: '',
          alt: '',
          hint: '',
          title: '',
          subtitle: '',
          ctaLink: '',
          ctaText: '',
        });
        setImagePreview(undefined);
      }
      setFileName(undefined); // Clear file name on open/reset
    }
  }, [isOpen, slide, reset]);

  useEffect(() => {
    setImagePreview(watchedSrc);
  }, [watchedSrc]);

  // Handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsUploading(true);
      setUploadProgress(0);
      setImagePreview(undefined); // Clear previous preview
      setValue('src', '', { shouldValidate: false }); // Clear URL field while uploading

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Use fetch to call the upload API route
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(Math.min(progress, 90)); // Stop at 90 until fetch completes
          if (progress >= 90) clearInterval(interval);
        }, 100);

        const result = await response.json();
        clearInterval(interval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error(result.message || 'Upload failed');
        }

        // Update the form with the returned URL
        setValue('src', result.url, { shouldValidate: true });
        setImagePreview(result.url);
        setFileName(undefined);
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
        event.target.value = '';
        setFileName(undefined);
        setImagePreview(watchedSrc || undefined);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      setFileName(undefined);
    }
  };

  const onSubmit: SubmitHandler<HeroSlideFormData> = async (data) => {
    setIsSaving(true);
    try {
      let savedSlide: HeroSlide | null;
      const dataToSave = { ...data };

      if (isEditing && slide) {
        savedSlide = await updateHeroSlide(slide.id, dataToSave);
        if (!savedSlide) throw new Error("Update failed");
        toast({ title: "Success", description: "Hero slide updated successfully." });
      } else {
        savedSlide = await createHeroSlide(dataToSave);
        toast({ title: "Success", description: "Hero slide created successfully." });
      }
      onSuccess(savedSlide);
      setFileName(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} hero slide. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setImagePreview(undefined);
      setFileName(undefined);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Hero Slide' : 'Add New Hero Slide'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the hero slide.' : 'Enter the details for the new hero slide.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Source URL Input */}
          <div className="space-y-1">
            <Label htmlFor="src">Image URL</Label>
            <Input 
              id="src" 
              {...register("src")} 
              placeholder="https://example.com/image.jpg or upload below" 
              disabled={isSaving || isUploading}
              onChange={(e) => {
                setValue("src", e.target.value, { shouldValidate: true });
                setImagePreview(e.target.value || undefined);
                setFileName(undefined); // Clear file name if URL is typed
              }}
            />
            {errors.src && <p className="text-sm text-destructive">{errors.src.message}</p>}
            <p className="text-xs text-muted-foreground">Enter a full URL (https://...) or use the upload option below.</p>
          </div>

          {/* File Upload Input */}
          <div className="space-y-1">
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
            <div className="space-y-1">
              <Label>Preview</Label>
               <div className="relative h-40 w-full rounded border overflow-hidden bg-muted">
                 <Image
                   src={imagePreview}
                   alt="Preview"
                   fill={true}
                   style={{ objectFit: 'cover' }}
                   unoptimized
                   onError={() => {
                     console.warn(`Failed to load image preview: ${imagePreview}`);
                     setImagePreview(undefined);
                   }}
                 />
               </div>
            </div>
           )}

          {/* Alt Text */}
          <div className="space-y-1">
            <Label htmlFor="alt">Alternative Text (Required)</Label>
            <Input id="alt" {...register("alt")} placeholder="Describe the image" disabled={isSaving || isUploading} />
            {errors.alt && <p className="text-sm text-destructive">{errors.alt.message}</p>}
          </div>

           {/* AI Hint */}
           <div className="space-y-1">
            <Label htmlFor="hint">AI Hint (Optional)</Label>
            <Input id="hint" {...register("hint")} placeholder="e.g., modern hospital" disabled={isSaving || isUploading} />
             <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.hint && <p className="text-sm text-destructive">{errors.hint.message}</p>}
          </div>

          {/* Title (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input id="title" {...register("title")} placeholder="e.g., Welcome to Our Hospital" disabled={isSaving || isUploading} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Subtitle (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="subtitle">Subtitle (Optional)</Label>
            <Textarea id="subtitle" {...register("subtitle")} rows={2} placeholder="e.g., Providing excellent care..." disabled={isSaving || isUploading} />
            {errors.subtitle && <p className="text-sm text-destructive">{errors.subtitle.message}</p>}
          </div>

          {/* CTA Link (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="ctaLink">CTA Link (Optional)</Label>
            <Input id="ctaLink" {...register("ctaLink")} placeholder="e.g., /services or #contact" disabled={isSaving || isUploading} />
            {errors.ctaLink && <p className="text-sm text-destructive">{errors.ctaLink.message}</p>}
            <p className="text-xs text-muted-foreground">Can be a URL, relative path (/page), or hash link (#section).</p>
          </div>

          {/* CTA Text (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="ctaText">CTA Text (Optional)</Label>
            <Input id="ctaText" {...register("ctaText")} placeholder="e.g., Learn More" disabled={isSaving || isUploading} />
            {errors.ctaText && <p className="text-sm text-destructive">{errors.ctaText.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving || isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? 'Saving...' : (isUploading ? 'Uploading...' : (isEditing ? 'Save Changes' : 'Create Slide'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

