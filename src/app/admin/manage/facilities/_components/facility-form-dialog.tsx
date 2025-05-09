
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as LucideIcons from 'lucide-react';
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
import { createFacility, updateFacility, Facility } from '@/lib/mock-data';
import DynamicIcon from '@/lib/icons';
import NextImage from 'next/image'; // Renamed to avoid conflict

// Generate list of valid Lucide icon names
const availableIconNames = Object.keys(LucideIcons)
  .filter(key => {
    const value = LucideIcons[key as keyof typeof LucideIcons];
    return typeof value === 'function' &&
           key[0] === key[0].toUpperCase() && 
           key !== 'LucideIcon';
  })
  .sort();

// Define Zod schema for validation
const facilitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Short description must be at least 10 characters long").max(150, "Short description max 150 chars"),
  detailedDescription: z.string().min(20, "Detailed description must be at least 20 characters long"),
  iconName: z.string().refine(val => availableIconNames.includes(val), {
       message: "Please select a valid icon",
   }),
  imageUrl: z.string().optional().or(z.literal('')).refine(value => {
    if (!value) return true; 
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image');
  }, { message: "Must be a valid URL or an uploaded image." }),
  imageHint: z.string().max(50, "AI hint should be concise (max 50 chars)").optional(),
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
  const isEditing = !!facility;
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
     defaultValues: {
      name: '',
      description: '',
      detailedDescription: '',
      iconName: 'HelpCircle',
      imageUrl: '',
      imageHint: '',
    }
  });

   const watchedImageUrl = watch('imageUrl');

  useEffect(() => {
    if (isOpen) {
      if (facility) {
        reset({
            name: facility.name,
            description: facility.description,
            detailedDescription: facility.detailedDescription,
            iconName: availableIconNames.includes(facility.iconName) ? facility.iconName : 'HelpCircle',
            imageUrl: facility.imageUrl || '',
            imageHint: facility.imageHint || '',
        });
        setImagePreview(facility.imageUrl);
      } else {
        reset({ 
            name: '',
            description: '',
            detailedDescription: '',
            iconName: 'HelpCircle',
            imageUrl: '',
            imageHint: '',
        });
        setImagePreview(undefined);
      }
      setFileName(undefined);
    }
  }, [isOpen, facility, reset]);

  useEffect(() => {
    setImagePreview(watchedImageUrl);
  }, [watchedImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue('imageUrl', dataUri, { shouldValidate: true });
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(undefined);
    }
  };

  const onSubmit: SubmitHandler<FacilityFormData> = async (data) => {
    setIsSaving(true);
    try {
       let savedFacility: Facility | null;
       const dataToSave = { 
           ...data, 
           imageUrl: data.imageUrl || '',
           imageHint: data.imageHint || '',
        };

       if (isEditing && facility) {
        savedFacility = await updateFacility(facility.id, dataToSave);
        if (!savedFacility) throw new Error("Update failed");
        toast({ title: "Success", description: "Facility updated successfully." });
      } else {
        savedFacility = await createFacility(dataToSave);
        toast({ title: "Success", description: "Facility created successfully." });
      }
      onSuccess(savedFacility);
      setFileName(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} facility. Please try again.`,
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
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Facility' : 'Add New Facility'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the facility.' : 'Enter the details for the new facility.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 pr-2">
           {/* Facility Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Facility Name</Label>
            <Input id="name" {...register("name")} disabled={isSaving} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Short Description (for card)</Label>
            <Textarea id="description" {...register("description")} rows={3} disabled={isSaving} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

           {/* Detailed Description */}
           <div className="space-y-1">
            <Label htmlFor="detailedDescription">Detailed Description (for modal)</Label>
            <Textarea id="detailedDescription" {...register("detailedDescription")} rows={5} disabled={isSaving} />
            {errors.detailedDescription && <p className="text-sm text-destructive">{errors.detailedDescription.message}</p>}
          </div>

          {/* Icon Selector */}
           <div className="space-y-1">
             <Label htmlFor="iconName">Icon</Label>
              <Controller
                name="iconName"
                control={control}
                render={({ field }) => (
                  <Select
                     onValueChange={field.onChange}
                     value={field.value}
                     disabled={isSaving}
                  >
                    <SelectTrigger id="iconName" className="w-full">
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={field.value || 'HelpCircle'} className="h-5 w-5" />
                        <SelectValue placeholder="Select an icon" />
                       </div>
                    </SelectTrigger>
                    <SelectContent>
                       <ScrollArea className="h-[200px]">
                        {availableIconNames.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                             <div className="flex items-center gap-2">
                               <DynamicIcon name={icon} className="h-5 w-5" />
                               <span>{icon}</span>
                             </div>
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                )}
             />
              {errors.iconName && <p className="text-sm text-destructive">{errors.iconName.message}</p>}
           </div>

           {/* Image URL Input */}
          <div className="space-y-1">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input 
              id="imageUrl" 
              {...register("imageUrl")} 
              placeholder="https://example.com/image.jpg or leave blank to upload" 
              disabled={isSaving} 
              onChange={(e) => {
                setValue("imageUrl", e.target.value, {shouldValidate: true});
                setImagePreview(e.target.value);
                setFileName(undefined); // Clear file name if URL is typed
              }}
            />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
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
                <Label>Image Preview</Label>
                <div className="relative h-32 w-full max-w-xs rounded border overflow-hidden bg-muted">
                    <NextImage
                     src={imagePreview}
                     alt="Facility image preview"
                     layout="fill"
                     objectFit="cover"
                     unoptimized 
                    />
                </div>
            </div>
          )}

           {/* Image AI Hint */}
           <div className="space-y-1">
            <Label htmlFor="imageHint">Image AI Hint (Optional)</Label>
            <Input id="imageHint" {...register("imageHint")} placeholder="e.g., modern lab" disabled={isSaving} />
            <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.imageHint && <p className="text-sm text-destructive">{errors.imageHint.message}</p>}
          </div>


          <DialogFooter className="pt-2">
             <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                 Cancel
             </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Facility')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
