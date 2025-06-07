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
import { createDepartment, updateDepartment, Department } from '@/lib/mock-data';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress'; // Import Progress component

// Define Zod schema for validation
const departmentSchema = z.object({
  name: z.string().min(3, "Department name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  detailedDescription: z.string().min(20, "Detailed description must be at least 20 characters long"),
  iconName: z.string().min(1, "Icon name is required"),
  headOfDepartmentImage: z.string().optional().or(z.literal(''))
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
  headOfDepartmentImageHint: z.string().optional().or(z.literal('')),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  department: Department | null;
  onSuccess: (department: Department) => void;
}

export default function DepartmentFormDialog({ isOpen, setIsOpen, department, onSuccess }: DepartmentFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      description: '',
      detailedDescription: '',
      iconName: 'Stethoscope', // Default icon for departments
      headOfDepartmentImage: '',
      headOfDepartmentImageHint: '',
    },
  });

  const watchedImageUrl = watch('headOfDepartmentImage');

  // Reset form when dialog opens/closes or department changes
  useEffect(() => {
    if (isOpen) {
      if (department) {
        // Edit mode - populate form with department data
        reset({
          name: department.name || '',
          description: department.description || '',
          detailedDescription: department.detailedDescription || department.description || '',
          iconName: department.iconName || 'Stethoscope',
          headOfDepartmentImage: department.headOfDepartmentImage || '',
          headOfDepartmentImageHint: department.headOfDepartmentImageHint || '',
        });
        setImagePreview(department.headOfDepartmentImage || undefined);
      } else {
        // Add mode - reset to defaults
        reset({
          name: '',
          description: '',
          detailedDescription: '',
          iconName: 'Stethoscope',
          headOfDepartmentImage: '',
          headOfDepartmentImageHint: '',
        });
        setImagePreview(undefined);
      }
      setFileName(undefined);
    }
  }, [isOpen, department, reset]);

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
      setValue('headOfDepartmentImage', '', { shouldValidate: false }); // Clear URL field while uploading

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
        setValue('headOfDepartmentImage', result.url, { shouldValidate: true });
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

  const onSubmit: SubmitHandler<DepartmentFormData> = async (data) => {
    setIsSaving(true);
    try {
      let savedDepartment: Department;
      
      if (department) {
        // Update existing department
        savedDepartment = await updateDepartment({
          ...data,
          id: department.id,
        });
      } else {
        // Create new department
        savedDepartment = await createDepartment(data);
      }
      
      onSuccess(savedDepartment);
      toast({
        title: "Success",
        description: `Department ${department ? 'updated' : 'created'} successfully.`,
      });
      
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${department ? 'update' : 'create'} department. Please try again.`,
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
          <DialogTitle>{department ? 'Edit' : 'Add'} Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Department Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Department Name</Label>
              <Input 
                id="name" 
                {...register("name")} 
                placeholder="e.g., Cardiology" 
                disabled={isSaving || isUploading}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Short Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea 
                id="description" 
                {...register("description")}
                onChange={handleDescriptionChange}
                placeholder="Brief description of the department..." 
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
                placeholder="Provide a detailed description of the department..." 
                rows={4}
                disabled={isSaving || isUploading}
              />
              {errors.detailedDescription && <p className="text-sm text-destructive">{errors.detailedDescription.message}</p>}
            </div>

            {/* Icon Name */}
            <div className="grid gap-2">
              <Label htmlFor="iconName">Icon Name</Label>
              <Input 
                id="iconName" 
                {...register("iconName")} 
                placeholder="e.g., Stethoscope" 
                disabled={isSaving || isUploading}
              />
              {errors.iconName && <p className="text-sm text-destructive">{errors.iconName.message}</p>}
              <p className="text-xs text-muted-foreground">Enter a valid icon name (e.g., Stethoscope, Heart, Hospital)</p>
            </div>

            {/* Head of Department Image */}
            <div className="grid gap-2">
              <Label htmlFor="headOfDepartmentImage">Head of Department Image URL (Optional)</Label>
              <Input 
                id="headOfDepartmentImage" 
                {...register("headOfDepartmentImage")} 
                placeholder="https://example.com/image.jpg or upload below" 
                disabled={isSaving || isUploading}
                onChange={(e) => {
                  setValue("headOfDepartmentImage", e.target.value, {shouldValidate: true});
                  setImagePreview(e.target.value || undefined);
                  setFileName(undefined);
                }}
              />
              {errors.headOfDepartmentImage && <p className="text-sm text-destructive">{errors.headOfDepartmentImage.message}</p>}
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
                    alt="Department head image preview"
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
              <Label htmlFor="headOfDepartmentImageHint">Image AI Hint (Optional)</Label>
              <Input 
                id="headOfDepartmentImageHint" 
                {...register("headOfDepartmentImageHint")} 
                placeholder="e.g., doctor cardiology" 
                disabled={isSaving || isUploading}
              />
              <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
              {errors.headOfDepartmentImageHint && <p className="text-sm text-destructive">{errors.headOfDepartmentImageHint.message}</p>}
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

