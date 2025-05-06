'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { createGalleryItem, updateGalleryItem, GalleryItem } from '@/lib/mock-data';
import Image from 'next/image';

// Define Zod schema for validation
const gallerySchema = z.object({
  type: z.enum(['photo', 'video']),
  src: z.string().url("Source must be a valid URL (e.g., https://...)"),
  alt: z.string().min(5, "Alternative text must be at least 5 characters long"),
  hint: z.string().max(50, "AI hint should be concise (max 50 chars)").optional(), // Optional AI hint
});

type GalleryFormData = z.infer<typeof gallerySchema>;

interface GalleryFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: GalleryItem | null; // Item data for editing, null for adding
  onSuccess: (item: GalleryItem) => void; // Callback on successful save
}

export default function GalleryFormDialog({ isOpen, setIsOpen, item, onSuccess }: GalleryFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!item;

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      type: 'photo',
      src: '',
      alt: '',
      hint: '',
    }
  });

  const srcUrl = watch('src'); // Watch the src field for preview
  const itemType = watch('type');

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          type: item.type,
          src: item.src,
          alt: item.alt,
          hint: item.hint || '',
        });
      } else {
        reset({ // Reset to default values for adding new
          type: 'photo',
          src: '',
          alt: '',
          hint: '',
        });
      }
    }
  }, [isOpen, item, reset]);

  const onSubmit: SubmitHandler<GalleryFormData> = async (data) => {
    setIsSaving(true);
    try {
      let savedItem: GalleryItem | null;
      if (isEditing && item) {
        savedItem = await updateGalleryItem(item.id, data);
        if (!savedItem) throw new Error("Update failed");
        toast({ title: "Success", description: "Gallery item updated successfully." });
      } else {
        savedItem = await createGalleryItem(data);
        toast({ title: "Success", description: "Gallery item created successfully." });
      }
      onSuccess(savedItem);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} gallery item. Please try again.`,
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

   // Basic URL validation for preview
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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Gallery Item' : 'Add New Gallery Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the photo or video.' : 'Enter the details for the new photo or video.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Item Type */}
          <Controller
             name="type"
             control={control}
             render={({ field }) => (
               <div className="space-y-2">
                 <Label>Item Type</Label>
                 <RadioGroup
                   onValueChange={field.onChange}
                   value={field.value}
                   className="flex space-x-4"
                   disabled={isSaving}
                 >
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="photo" id="r-photo" />
                     <Label htmlFor="r-photo">Photo</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="video" id="r-video" />
                     <Label htmlFor="r-video">Video</Label>
                   </div>
                 </RadioGroup>
               </div>
             )}
           />
           {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}


          {/* Source URL */}
          <div className="space-y-1">
            <Label htmlFor="src">Source URL</Label>
            <Input id="src" {...register("src")} placeholder="https://picsum.photos/400/300" disabled={isSaving} />
            {errors.src && <p className="text-sm text-destructive">{errors.src.message}</p>}
          </div>

           {/* Preview (only for valid image URLs or video placeholders) */}
          {(itemType === 'photo' && isValidUrl(srcUrl)) && (
            <div className="space-y-1">
              <Label>Preview</Label>
               <div className="relative h-32 w-full rounded border overflow-hidden bg-muted">
                 <Image
                   src={srcUrl!} // Assert non-null because isValidUrl passed
                   alt="Preview"
                   layout="fill"
                   objectFit="contain" // Use contain to see the whole image
                   unoptimized
                 />
               </div>
            </div>
           )}
           {itemType === 'video' && (
              <div className="space-y-1">
                <Label>Preview (Video)</Label>
                <div className="relative h-32 w-full rounded border overflow-hidden bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  Video Preview Placeholder <br/> (URL: {isValidUrl(srcUrl) ? "Valid" : "Invalid"})
                </div>
              </div>
           )}

          {/* Alt Text */}
          <div className="space-y-1">
            <Label htmlFor="alt">Alternative Text (Required)</Label>
            <Input id="alt" {...register("alt")} placeholder="Describe the image/video" disabled={isSaving} />
            {errors.alt && <p className="text-sm text-destructive">{errors.alt.message}</p>}
          </div>

           {/* AI Hint */}
           <div className="space-y-1">
            <Label htmlFor="hint">AI Hint (Optional)</Label>
            <Input id="hint" {...register("hint")} placeholder="e.g., hospital lobby" disabled={isSaving} />
             <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.hint && <p className="text-sm text-destructive">{errors.hint.message}</p>}
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Item')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
