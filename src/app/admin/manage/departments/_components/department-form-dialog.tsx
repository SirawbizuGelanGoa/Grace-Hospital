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

// Reuse icon list logic
const availableIconNames = Object.keys(LucideIcons).filter(key =>
    key !== 'createLucideIcon' && key !== 'LucideIcon' && typeof LucideIcons[key as keyof typeof LucideIcons] !== 'string' && !key.includes('Provider')
).sort();

// Define Zod schema for validation
const departmentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
   iconName: z.string().refine(val => availableIconNames.includes(val), {
       message: "Please select a valid icon",
   }),
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

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
     defaultValues: {
      name: '',
      description: '',
      iconName: 'HelpCircle',
    }
  });

   const selectedIconName = watch("iconName");

  useEffect(() => {
    if (isOpen) {
      if (department) {
        reset({
            name: department.name,
            description: department.description,
            iconName: availableIconNames.includes(department.iconName) ? department.iconName : 'HelpCircle',
        });
      } else {
        reset({
            name: '',
            description: '',
            iconName: 'HelpCircle',
        });
      }
    }
  }, [isOpen, department, reset]);

  const onSubmit: SubmitHandler<DepartmentFormData> = async (data) => {
    setIsSaving(true);
    try {
       let savedDepartment: Department | null;
       if (isEditing && department) {
        savedDepartment = await updateDepartment(department.id, data);
        if (!savedDepartment) throw new Error("Update failed");
        toast({ title: "Success", description: "Department updated successfully." });
      } else {
        savedDepartment = await createDepartment(data);
        toast({ title: "Success", description: "Department created successfully." });
      }
      onSuccess(savedDepartment);
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
    }
    setIsOpen(open);
  };


  return (
     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Department' : 'Add New Department'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the department.' : 'Enter the details for the new department.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="name">Department Name</Label>
            <Input id="name" {...register("name")} disabled={isSaving} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={4} disabled={isSaving} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
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
                       <ScrollArea className="h-[250px]">
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

          <DialogFooter>
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
