'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { createFacility, updateFacility, Facility } from '@/lib/mock-data';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress'; // Import Progress component

// Define Zod schema for validation
const facilitySchema = z.object({
  name: z.string().min(3, "Facility name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  detailedDescription: z.string().min(20, "Detailed description must be at least 20 characters long"),
  iconName: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal(''))
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
  imageHint: z.string().optional().or(z.literal('')),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

interface FacilityFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  facility: Facility | null;
  onSuccess: (facility: Facility) => void;
}

export default function FacilityFormDialog({ isOpen, setIsOpen, facility, onSuccess }: FacilityFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: '',
      description: '',
      detailedDescription: '',
      iconName: 'Building', // Default icon
      imageUrl: '',
      imageHint: '',
    },
  });

  const watchedImageUrl = watch('imageUrl');

  // Reset form when dialog opens/closes or facility changes
  useEffect(() => {
    if (isOpen) {
      if (facility) {
        // Edit mode - populate form with facility data
        reset({
          name: facility.name || '',
          description: facility.description || '',
          detailedDescription: facility.detailedDescription || facility.description || '',
          iconName: facility.iconName || 'Building',
          imageUrl: facility.imageUrl || '',
          imageHint: facility.imageHint || '',
        });
        setImagePreview(facility.imageUrl || undefined);
      } else {
        // Add mode - reset to defaults
        reset({
          name: '',
          description: '',
          detailedDescription: '',
          iconName: 'Building',
          imageUrl: '',
          imageHint: '',
        });
        setImagePreview(undefined);
      }
      setFileName(undefined);
    }
  }, [isOpen, facility, reset]);

  // Update preview when imageUrl changes
  useEffect(() => {
    setImagePreview(watchedImageUrl || undefined);
  }, [watchedImageUrl]);

  // Handle file upload
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
        setValue('imageUrl', result.url, { shouldValidate: true });
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
        setImagePreview(watchedImageUrl || undefined);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      setFileName(undefined);
    }
  };

  const onSubmit: SubmitHandler<FacilityFormData> = async (data) => {
    setIsSaving(true);
    try {
      let savedFacility: Facility;
      
      if (facility) {
        // Update existing facility
        savedFacility = await updateFacility({
          ...data,
          id: facility.id,
        });
      } else {
        // Create new facility
        savedFacility = await createFacility(data);
      }
      
      onSuccess(savedFacility);
      toast({
        title: "Success",
        description: `Facility ${facility ? 'updated' : 'created'} successfully.`,
      });
      
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${facility ? 'update' : 'create'} facility. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Copy description to detailedDescription if the latter is empty
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const descriptionValue = e.target.value;
    register("description").onChange(e);
    
    // If detailed description is empty, copy the description value to it
    const detailedDescValue = watch("detailedDescription");
    if (!detailedDescValue) {
      setValue("detailedDescription", descriptionValue, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{facility ? 'Edit' : 'Add'} Facility</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Facility Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Facility Name</Label>
              <Input 
                id="name" 
                {...register("name")} 
                placeholder="e.g., MRI Scanner" 
                disabled={isSaving || isUploading}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea 
                id="description" 
                {...register("description")}
                onChange={handleDescriptionChange}
                placeholder="Brief description of the facility..." 
                rows={2}
                disabled={isSaving || isUploading}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            {/* Detailed Description */}
            <div className="grid gap-2">
              <Label htmlFor="detailedDescription">Detailed Description</Label>
              <Textarea 
                id="detailedDescription" 
                {...register("detailedDescription")} 
                placeholder="Provide a detailed description of the facility..." 
                rows={4}
                disabled={isSaving || isUploading}
              />
              {errors.detailedDescription && <p className="text-sm text-destructive">{errors.detailedDescription.message}</p>}
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input 
                id="imageUrl" 
                {...register("imageUrl")} 
                placeholder="https://example.com/image.jpg or upload below" 
                disabled={isSaving || isUploading}
                onChange={(e) => {
                  setValue("imageUrl", e.target.value, {shouldValidate: true});
                  setImagePreview(e.target.value || undefined);
                  setFileName(undefined);
                }}
              />
              {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
              <p className="text-xs text-muted-foreground">Enter a full URL (https://...) or use the upload option below.</p>
            </div>

            {/* File Upload */}
            <div className="grid gap-2">
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
              <div className="grid gap-2">
                <Label>Image Preview</Label>
                <div className="relative h-40 w-full rounded border overflow-hidden bg-muted">
                  <Image
                    src={imagePreview}
                    alt="Facility image preview"
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

            {/* AI Hint */}
            <div className="grid gap-2">
              <Label htmlFor="imageHint">Image AI Hint (Optional)</Label>
              <Input 
                id="imageHint" 
                {...register("imageHint")} 
                placeholder="e.g., MRI machine" 
                disabled={isSaving || isUploading}
              />
              <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
              {errors.imageHint && <p className="text-sm text-destructive">{errors.imageHint.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              disabled={isSaving || isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || isUploading}
            >
              {isSaving ? 'Saving...' : (isUploading ? 'Uploading...' : 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

