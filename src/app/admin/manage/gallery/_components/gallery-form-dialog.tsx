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
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

// Define Zod schema for validation
const gallerySchema = z.object({
  type: z.enum(['photo', 'video']),
  src: z.string().min(1, "Source is required.").refine(value => {
    // Valid if it's an absolute URL (http/https)
    if (value.startsWith('http://') || value.startsWith('https://')) return true;
    
    // Valid if it's a relative path from our upload API
    if (value.startsWith('/uploads/')) return true;
    
    // Otherwise invalid
    return false;
  }, { message: "Must be a valid URL (e.g., https://...) or an uploaded file path" }),
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  // Handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsUploading(true);
      setUploadProgress(0);
      setFilePreview(undefined); // Clear previous preview
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
        setFilePreview(result.url);
        setFileName(undefined);
        toast({
          title: "Success",
          description: `${itemType === 'photo' ? 'Image' : 'Video'} uploaded successfully.`,
        });

      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Upload Error",
          description: error.message || "Failed to upload file. Please try again.",
          variant: "destructive",
        });
        event.target.value = '';
        setFileName(undefined);
        setFilePreview(watchedSrc || undefined);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
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
                   disabled={isSaving || isUploading}
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
              placeholder={`https://example.com/${itemType === 'photo' ? 'image.jpg' : 'video.mp4'} or upload below`}
              disabled={isSaving || isUploading}
              onChange={(e) => {
                setValue("src", e.target.value, { shouldValidate: true });
                setFilePreview(e.target.value || undefined);
                setFileName(undefined);
              }}
            />
            {errors.src && <p className="text-sm text-destructive">{errors.src.message}</p>}
            <p className="text-xs text-muted-foreground">Enter a full URL (https://...) or use the upload option below.</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="fileUpload">Or Upload File (Image/Video)</Label>
            <Input 
              id="fileUpload" 
              type="file" 
              accept={itemType === 'photo' ? "image/*" : "video/*"}
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

          {filePreview && itemType === 'photo' && (
            <div className="space-y-1">
              <Label>Preview</Label>
               <div className="relative h-32 w-full rounded border overflow-hidden bg-muted">
                 <Image
                   src={filePreview}
                   alt="Preview"
                   fill={true}
                   style={{ objectFit: 'contain' }}
                   unoptimized
                   onError={() => {
                     console.warn(`Failed to load image preview: ${filePreview}`);
                     setFilePreview(undefined);
                   }}
                 />
               </div>
            </div>
           )}
           {filePreview && itemType === 'video' && (
              <div className="space-y-1">
                <Label>Preview (Video)</Label>
                <div className="relative h-32 w-full rounded border overflow-hidden bg-muted flex items-center justify-center">
                  {filePreview.startsWith('http') || filePreview.startsWith('/uploads') ? (
                    <video 
                      controls 
                      src={filePreview} 
                      className="max-h-full max-w-full"
                      onError={() => {
                        console.warn(`Failed to load video preview: ${filePreview}`);
                        setFilePreview(undefined);
                      }}
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">Video Preview (URL or upload)</span>
                  )}
                </div>
              </div>
           )}

          <div className="space-y-1">
            <Label htmlFor="alt">Alternative Text (Required)</Label>
            <Input id="alt" {...register("alt")} placeholder="Describe the image/video" disabled={isSaving || isUploading} />
            {errors.alt && <p className="text-sm text-destructive">{errors.alt.message}</p>}
          </div>

           <div className="space-y-1">
            <Label htmlFor="hint">AI Hint (Optional)</Label>
            <Input id="hint" {...register("hint")} placeholder="e.g., hospital lobby" disabled={isSaving || isUploading} />
             <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.hint && <p className="text-sm text-destructive">{errors.hint.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving || isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? 'Saving...' : (isUploading ? 'Uploading...' : (isEditing ? 'Save Changes' : 'Create Item'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

