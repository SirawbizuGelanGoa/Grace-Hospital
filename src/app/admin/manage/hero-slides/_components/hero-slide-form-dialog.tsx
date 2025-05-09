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
  src: z.string().url("Source must be a valid URL (e.g., https://...)"),
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

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<HeroSlideFormData>({
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

  const srcUrl = watch('src');

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
      }
    }
  }, [isOpen, slide, reset]);

  const onSubmit: SubmitHandler<HeroSlideFormData> = async (data) => {
    setIsSaving(true);
    try {
      let savedSlide: HeroSlide | null;
      const dataToSave = {
        ...data,
      };

      if (isEditing && slide) {
        savedSlide = await updateHeroSlide(slide.id, dataToSave);
        if (!savedSlide) throw new Error("Update failed");
        toast({ title: "Success", description: "Hero slide updated successfully." });
      } else {
        savedSlide = await createHeroSlide(dataToSave);
        toast({ title: "Success", description: "Hero slide created successfully." });
      }
      onSuccess(savedSlide);
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
    }
    setIsOpen(open);
  };

   const isValidUrl = (url: string | undefined): boolean => {
     if (!url) return false;
     try {
       new URL(url);
       return true;
     } catch (_) {
       return false;
     }
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
          {/* Source URL */}
          <div className="space-y-1">
            <Label htmlFor="src">Image URL</Label>
            <Input id="src" {...register("src")} placeholder="https://picsum.photos/1200/800" disabled={isSaving} />
            {errors.src && <p className="text-sm text-destructive">{errors.src.message}</p>}
          </div>

          {/* Image Preview */}
          {isValidUrl(srcUrl) && (
            <div className="space-y-1">
              <Label>Preview</Label>
               <div className="relative h-40 w-full rounded border overflow-hidden bg-muted">
                 <NextImage
                   src={srcUrl!}
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
