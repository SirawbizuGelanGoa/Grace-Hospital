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
  src: z.string().min(1, "Source is required.").refine(value => 
    value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image') || value.startsWith('data:video'), 
    { message: "Must be a valid URL or an uploaded file." }
  ),
  alt: z.string().min(5, "Alternative text must be at least 5 characters long"),
  hint: z.string().max(50, "AI hint should be concise (max 50 chars)").optional(),
});

type GalleryFormData = z.infer<typeof gallerySchema>;

interface GalleryFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: GalleryItem | null;
  onSuccess: (item: GalleryItem) => void;
}

export default function GalleryFormDialog({ isOpen, setIsOpen, item, onSuccess }: GalleryFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!item;
  const [filePreview, setFilePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      type: 'photo',
      src: '',
      alt: '',
      hint: '',
    }
  });

  const watchedSrc = watch('src');
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
        setFilePreview(item.src);
      } else {
        reset({
          type: 'photo',
          src: '',
          alt: '',
          hint: '',
        });
        setFilePreview(undefined);
      }
      setFileName(undefined);
    }
  }, [isOpen, item, reset]);

  useEffect(() => {
    setFilePreview(watchedSrc);
  }, [watchedSrc]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue('src', dataUri, { shouldValidate: true });
        setFilePreview(dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(undefined);
    }
  };

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
      setFileName(undefined);
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
      setFilePreview(undefined);
      setFileName(undefined);
    }
    setIsOpen(open);
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

          <div className="space-y-1">
            <Label htmlFor="src">Source URL</Label>
            <Input 
              id="src" 
              {...register("src")} 
              placeholder="https://picsum.photos/400/300 or leave blank to upload" 
              disabled={isSaving}
              onChange={(e) => {
                setValue("src", e.target.value, { shouldValidate: true });
                setFilePreview(e.target.value);
                setFileName(undefined);
              }}
            />
            {errors.src && <p className="text-sm text-destructive">{errors.src.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="fileUpload">Or Upload File (Image/Video)</Label>
            <Input 
              id="fileUpload" 
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange} 
              disabled={isSaving}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {fileName && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}
          </div>

          {filePreview && itemType === 'photo' && (
            <div className="space-y-1">
              <Label>Preview</Label>
               <div className="relative h-32 w-full rounded border overflow-hidden bg-muted">
                 <Image
                   src={filePreview}
                   alt="Preview"
                   layout="fill"
                   objectFit="contain"
                   unoptimized
                 />
               </div>
            </div>
           )}
           {filePreview && itemType === 'video' && (
              <div className="space-y-1">
                <Label>Preview (Video)</Label>
                <div className="relative h-32 w-full rounded border overflow-hidden bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  {filePreview.startsWith('data:video') ? 
                    <video controls src={filePreview} className="max-h-full max-w-full" /> : 
                    'Video Preview (URL or upload)'}
                </div>
              </div>
           )}

          <div className="space-y-1">
            <Label htmlFor="alt">Alternative Text (Required)</Label>
            <Input id="alt" {...register("alt")} placeholder="Describe the image/video" disabled={isSaving} />
            {errors.alt && <p className="text-sm text-destructive">{errors.alt.message}</p>}
          </div>

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
