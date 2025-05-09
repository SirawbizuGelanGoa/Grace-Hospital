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

// Generate list of valid Lucide icon names
const availableIconNames = Object.keys(LucideIcons)
  .filter(key => {
    const value = LucideIcons[key as keyof typeof LucideIcons];
    // Check if it's a function (React components are functions)
    // and if its name starts with an uppercase letter (convention for components)
    // and it's not one of the known non-icon utility exports.
    return typeof value === 'function' &&
           key[0] === key[0].toUpperCase() && // Ensures PascalCase like 'Activity'
           key !== 'LucideIcon'; // Exclude the base LucideIcon type/component factory helper
  })
  .sort();

// Define Zod schema for validation
const facilitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
   iconName: z.string().refine(val => availableIconNames.includes(val), {
       message: "Please select a valid icon",
   }),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

interface FacilityFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  facility: Facility | null; // Facility data for editing, null for adding
  onSuccess: (facility: Facility) => void; // Callback on successful save
}

export default function FacilityFormDialog({ isOpen, setIsOpen, facility, onSuccess }: FacilityFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!facility;

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
     defaultValues: {
      name: '',
      description: '',
      iconName: 'HelpCircle',
    }
  });

   const selectedIconName = watch("iconName");

  useEffect(() => {
    if (isOpen) {
      if (facility) {
        reset({
            name: facility.name,
            description: facility.description,
            iconName: availableIconNames.includes(facility.iconName) ? facility.iconName : 'HelpCircle',
        });
      } else {
        reset({ // Reset to default values for adding new
            name: '',
            description: '',
            iconName: 'HelpCircle',
        });
      }
    }
  }, [isOpen, facility, reset]);

  const onSubmit: SubmitHandler<FacilityFormData> = async (data) => {
    setIsSaving(true);
    try {
       let savedFacility: Facility | null;
       if (isEditing && facility) {
        savedFacility = await updateFacility(facility.id, data);
        if (!savedFacility) throw new Error("Update failed");
        toast({ title: "Success", description: "Facility updated successfully." });
      } else {
        savedFacility = await createFacility(data);
        toast({ title: "Success", description: "Facility created successfully." });
      }
      onSuccess(savedFacility);
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
    }
    setIsOpen(open);
  };


  return (
     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Facility' : 'Add New Facility'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the facility.' : 'Enter the details for the new facility.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
           {/* Facility Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Facility Name</Label>
            <Input id="name" {...register("name")} disabled={isSaving} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={4} disabled={isSaving} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
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
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Facility')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
