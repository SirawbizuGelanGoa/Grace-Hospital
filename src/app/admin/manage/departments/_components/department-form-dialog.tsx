
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
import { createDepartment, updateDepartment, Department } from '@/lib/mock-data';
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
const departmentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Short description must be at least 10 characters long").max(150, "Short description max 150 chars"),
  iconName: z.string().refine(val => availableIconNames.includes(val), {
       message: "Please select a valid icon",
   }),
  detailedDescription: z.string().min(20, "Detailed description must be at least 20 characters long"),
  headOfDepartmentImage: z.string().optional().or(z.literal('')).refine(value => {
    if (!value) return true; 
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image');
  }, { message: "Must be a valid URL or an uploaded image." }),
  headOfDepartmentImageHint: z.string().max(50, "AI hint should be concise (max 50 chars)").optional(),
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
  const isEditing = !!department;
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
     defaultValues: {
      name: '',
      description: '',
      iconName: 'HelpCircle',
      detailedDescription: '',
      headOfDepartmentImage: '',
      headOfDepartmentImageHint: '',
    }
  });

  const watchedIconName = watch("iconName");
  const watchedHeadImage = watch('headOfDepartmentImage');

  useEffect(() => {
    if (isOpen) {
      if (department) {
        reset({
            name: department.name,
            description: department.description,
            iconName: availableIconNames.includes(department.iconName) ? department.iconName : 'HelpCircle',
            detailedDescription: department.detailedDescription || '',
            headOfDepartmentImage: department.headOfDepartmentImage || '',
            headOfDepartmentImageHint: department.headOfDepartmentImageHint || '',
        });
        setImagePreview(department.headOfDepartmentImage);
      } else {
        reset({
            name: '',
            description: '',
            iconName: 'HelpCircle',
            detailedDescription: '',
            headOfDepartmentImage: '',
            headOfDepartmentImageHint: '',
        });
        setImagePreview(undefined);
      }
      setFileName(undefined);
    }
  }, [isOpen, department, reset]);

  useEffect(() => {
    setImagePreview(watchedHeadImage);
  }, [watchedHeadImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue('headOfDepartmentImage', dataUri, { shouldValidate: true });
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(undefined);
    }
  };


  const onSubmit: SubmitHandler<DepartmentFormData> = async (data) => {
    setIsSaving(true);
    try {
       let savedDepartment: Department | null;
       const dataToSave = {
           ...data,
           headOfDepartmentImage: data.headOfDepartmentImage || '',
           headOfDepartmentImageHint: data.headOfDepartmentImageHint || '',
       };

       if (isEditing && department) {
        savedDepartment = await updateDepartment(department.id, dataToSave);
        if (!savedDepartment) throw new Error("Update failed");
        toast({ title: "Success", description: "Department updated successfully." });
      } else {
        savedDepartment = await createDepartment(dataToSave);
        toast({ title: "Success", description: "Department created successfully." });
      }
      onSuccess(savedDepartment);
      setFileName(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} department. Please try again.`,
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
          <DialogTitle>{isEditing ? 'Edit Department' : 'Add New Department'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the department.' : 'Enter the details for the new department.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 pr-2">
          <div className="space-y-1">
            <Label htmlFor="name">Department Name</Label>
            <Input id="name" {...register("name")} disabled={isSaving} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Short Description (for accordion trigger)</Label>
            <Textarea id="description" {...register("description")} rows={3} disabled={isSaving} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="detailedDescription">Detailed Description</Label>
            <Textarea id="detailedDescription" {...register("detailedDescription")} rows={5} disabled={isSaving} />
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

          {/* Head of Department Image URL Input */}
          <div className="space-y-1">
            <Label htmlFor="headOfDepartmentImage">Head of Dept. Image URL (Optional)</Label>
            <Input 
              id="headOfDepartmentImage" 
              {...register("headOfDepartmentImage")} 
              placeholder="https://example.com/image.jpg or leave blank to upload" 
              disabled={isSaving} 
              onChange={(e) => {
                setValue("headOfDepartmentImage", e.target.value, {shouldValidate: true});
                setImagePreview(e.target.value);
                setFileName(undefined); 
              }}
            />
            {errors.headOfDepartmentImage && <p className="text-sm text-destructive">{errors.headOfDepartmentImage.message}</p>}
          </div>
          
          {/* Head of Department File Upload Input */}
          <div className="space-y-1">
            <Label htmlFor="hodImageUpload">Or Upload HOD Image</Label>
            <Input 
              id="hodImageUpload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={isSaving} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {fileName && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}
          </div>

           {/* Head of Department Image Preview */}
          {imagePreview && (
            <div className="space-y-1">
                <Label>HOD Image Preview</Label>
                <div className="relative h-32 w-32 rounded border overflow-hidden bg-muted">
                    <NextImage
                     src={imagePreview}
                     alt="Head of Department image preview"
                     layout="fill"
                     objectFit="cover"
                     unoptimized 
                    />
                </div>
            </div>
          )}

           {/* Head of Department Image AI Hint */}
           <div className="space-y-1">
            <Label htmlFor="headOfDepartmentImageHint">HOD Image AI Hint (Optional)</Label>
            <Input id="headOfDepartmentImageHint" {...register("headOfDepartmentImageHint")} placeholder="e.g., doctor smiling" disabled={isSaving} />
            <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.headOfDepartmentImageHint && <p className="text-sm text-destructive">{errors.headOfDepartmentImageHint.message}</p>}
          </div>

          <DialogFooter className="pt-2">
             <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                 Cancel
             </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Department')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

```