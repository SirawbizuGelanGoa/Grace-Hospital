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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { createService, updateService, Service } from '@/lib/mock-data';
import DynamicIcon, { availableIconNames } from '@/lib/icons';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

// Define Zod schema for validation
const serviceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Short description must be at least 10 characters long").max(150, "Short description cannot exceed 150 characters"),
  detailedDescription: z.string().min(20, "Detailed description must be at least 20 characters long"),
  iconName: z.string().optional(), // Made optional
  imageUrl: z.string().optional().or(z.literal('')).refine(value => {
    // Empty string is valid (optional image)
    if (!value) return true;
    
    // Valid if it's an absolute URL (http/https)
    if (value.startsWith('http://') || value.startsWith('https://')) return true;
    
    // Valid if it's a relative path from our upload API
    if (value.startsWith('/uploads/')) return true;
    
    // Otherwise invalid
    return false;
  }, { message: "Must be a valid URL (e.g., https://...) or an uploaded image path" }),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  service: Service | null;
  onSuccess: (service: Service) => void;
}

export default function ServiceFormDialog({ isOpen, setIsOpen, service, onSuccess }: ServiceFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const isEditing = !!service;

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      detailedDescription: '',
      iconName: 'HelpCircle', // Default to HelpCircle icon
      imageUrl: '',
    }
  });

  const selectedIconName = watch("iconName");
  const watchedImageUrl = watch('imageUrl');

  // Filter icons based on search query
  const filteredIcons = iconSearchQuery 
    ? availableIconNames.filter(icon => 
        icon.toLowerCase().includes(iconSearchQuery.toLowerCase())
      )
    : availableIconNames;

  useEffect(() => {
    if (isOpen) {
      if (service) {
        reset({
            name: service.name,
            description: service.description,
            detailedDescription: service.detailedDescription,
            iconName: service.iconName || 'HelpCircle', // Use HelpCircle as fallback
            imageUrl: service.imageUrl || '',
        });
        setImagePreview(service.imageUrl || undefined);
      } else {
        reset({ 
            name: '',
            description: '',
            detailedDescription: '',
            iconName: 'HelpCircle', // Default to HelpCircle icon for new services
            imageUrl: '',
        });
        setImagePreview(undefined);
      }
      setFileName(undefined);
      setIconSearchQuery('');
    }
  }, [isOpen, service, reset]);

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

  const onSubmit: SubmitHandler<ServiceFormData> = async (data) => {
    setIsSaving(true);
    try {
       let savedService: Service | null;
       if (isEditing && service) {
        savedService = await updateService(service.id, data);
        if (!savedService) throw new Error("Update failed");
        toast({ title: "Success", description: "Service updated successfully." });
      } else {
        savedService = await createService(data);
        toast({ title: "Success", description: "Service created successfully." });
      }
      onSuccess(savedService); 
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} service. Please try again.`,
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
        setIconSearchQuery('');
    }
    setIsOpen(open);
  };


  return (
     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the service.' : 'Enter the details for the new service.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-1">
            <Label htmlFor="name">Service Name</Label>
            <Input id="name" {...register("name")} disabled={isSaving || isUploading} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Short Description (for card front)</Label>
            <Textarea id="description" {...register("description")} rows={3} disabled={isSaving || isUploading} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

           <div className="space-y-1">
            <Label htmlFor="detailedDescription">Detailed Description (for card back)</Label>
            <Textarea id="detailedDescription" {...register("detailedDescription")} rows={5} disabled={isSaving || isUploading} />
            {errors.detailedDescription && <p className="text-sm text-destructive">{errors.detailedDescription.message}</p>}
          </div>

           <div className="space-y-1">
             <Label htmlFor="iconName">Icon</Label>
              <Controller
                name="iconName"
                control={control}
                render={({ field }) => (
                  <Select
                     onValueChange={field.onChange}
                     value={field.value}
                     disabled={isSaving || isUploading}
                  >
                    <SelectTrigger id="iconName" className="w-full">
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={field.value || 'HelpCircle'} className="h-5 w-5" />
                        <SelectValue placeholder="Select an icon" />
                       </div>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search icons..."
                          value={iconSearchQuery}
                          onChange={(e) => setIconSearchQuery(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      <ScrollArea className="h-[250px]"> 
                        {filteredIcons.length > 0 ? (
                          filteredIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center gap-2">
                                <DynamicIcon name={icon} className="h-5 w-5" />
                                <span>{icon}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-muted-foreground">
                            No icons found
                          </div>
                        )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                )}
             />
              {errors.iconName && <p className="text-sm text-destructive">{errors.iconName.message}</p>}
              <p className="text-xs text-muted-foreground">Default icon is "HelpCircle". You can search for icons by name.</p>
           </div>

          {/* Image URL */}
          <div className="space-y-1">
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
              <Label>Image Preview</Label>
              <div className="relative h-40 w-full rounded border overflow-hidden bg-muted">
                <Image
                  src={imagePreview}
                  alt="Service image preview"
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

          <DialogFooter className="pt-2">
             <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving || isUploading}>
                 Cancel
             </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? 'Saving...' : (isUploading ? 'Uploading...' : (isEditing ? 'Save Changes' : 'Create Service'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

