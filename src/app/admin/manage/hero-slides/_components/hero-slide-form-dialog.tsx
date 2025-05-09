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
import NextImage from 'next/image'; // Renamed to avoid conflict with Lucide's Image icon

// Define Zod schema for validation
const heroSlideSchema = z.object({
  src: z.string().min(1, "Image source is required.").refine(value => 
    value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image'), 
    { message: "Must be a valid URL or an uploaded image." }
  ),
  alt: z.string().min(5, "Alternative text must be at least 5 characters long"),
  hint: z.string().max(50, "AI hint should be concise (max 50 chars)").optional(),
  title: z.string().max(100, "Title cannot exceed 100 characters").optional(),
  subtitle: z.string().max(200, "Subtitle cannot exceed 200 characters").optional(),
  ctaLink: z.string().url("CTA Link must be a valid URL").optional().or(z.literal('')),
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue('src', dataUri, { shouldValidate: true });
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
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
              placeholder="https://picsum.photos/1200/800 or leave blank to upload" 
              disabled={isSaving}
              onChange={(e) => {
                setValue("src", e.target.value, { shouldValidate: true });
                setImagePreview(e.target.value);
                setFileName(undefined); // Clear file name if URL is typed
              }}
            />
            {errors.src && <p className="text-sm text-destructive">{errors.src.message}</p>}
          </div>

          {/* File Upload Input */}
          <div className="space-y-1">
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
            <div className="space-y-1">
              <Label>Preview</Label>
               <div className="relative h-40 w-full rounded border overflow-hidden bg-muted">
                 <NextImage
                   src={imagePreview}
                   alt="Preview"
                   layout="fill"
                   objectFit="cover"
                   unoptimized
                 />
               </div>
            </div>
           )}

          {/* Alt Text */}
          <div className="space-y-1">
            <Label htmlFor="alt">Alternative Text (Required)</Label>
            <Input id="alt" {...register("alt")} placeholder="Describe the image" disabled={isSaving} />
            {errors.alt && <p className="text-sm text-destructive">{errors.alt.message}</p>}
          </div>

           {/* AI Hint */}
           <div className="space-y-1">
            <Label htmlFor="hint">AI Hint (Optional)</Label>
            <Input id="hint" {...register("hint")} placeholder="e.g., modern hospital" disabled={isSaving} />
             <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.hint && <p className="text-sm text-destructive">{errors.hint.message}</p>}
          </div>

          {/* Title (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input id="title" {...register("title")} placeholder="e.g., Welcome to Our Hospital" disabled={isSaving} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Subtitle (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="subtitle">Subtitle (Optional)</Label>
            <Textarea id="subtitle" {...register("subtitle")} rows={2} placeholder="e.g., Providing excellent care..." disabled={isSaving} />
            {errors.subtitle && <p className="text-sm text-destructive">{errors.subtitle.message}</p>}
          </div>

          {/* CTA Link (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="ctaLink">CTA Link (Optional)</Label>
            <Input id="ctaLink" {...register("ctaLink")} placeholder="e.g., /services or #contact" disabled={isSaving} />
            {errors.ctaLink && <p className="text-sm text-destructive">{errors.ctaLink.message}</p>}
          </div>

          {/* CTA Text (Optional) */}
          <div className="space-y-1">
            <Label htmlFor="ctaText">CTA Text (Optional)</Label>
            <Input id="ctaText" {...register("ctaText")} placeholder="e.g., Learn More" disabled={isSaving} />
            {errors.ctaText && <p className="text-sm text-destructive">{errors.ctaText.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Slide')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
