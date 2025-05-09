'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as LucideIcons from 'lucide-react'; // Import all icons
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
import DynamicIcon from '@/lib/icons';

// Generate list of valid Lucide icon names
const availableIconNames = Object.keys(LucideIcons).filter(key =>
    key !== 'createLucideIcon' && key !== 'LucideIcon' && typeof LucideIcons[key as keyof typeof LucideIcons] !== 'string' && !key.includes('Provider')
).sort();


// Define Zod schema for validation
const serviceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Short description must be at least 10 characters long").max(150, "Short description cannot exceed 150 characters"),
  detailedDescription: z.string().min(20, "Detailed description must be at least 20 characters long"),
  iconName: z.string().refine(val => availableIconNames.includes(val), {
       message: "Please select a valid icon",
   }),
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
  const isEditing = !!service;

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      detailedDescription: '',
      iconName: 'HelpCircle', 
    }
  });

  const selectedIconName = watch("iconName"); 

  useEffect(() => {
    if (isOpen) {
      if (service) {
        reset({
            name: service.name,
            description: service.description,
            detailedDescription: service.detailedDescription,
            iconName: availableIconNames.includes(service.iconName) ? service.iconName : 'HelpCircle',
        });
      } else {
        reset({ 
            name: '',
            description: '',
            detailedDescription: '',
            iconName: 'HelpCircle',
        });
      }
    }
  }, [isOpen, service, reset]);

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
            <Input id="name" {...register("name")} disabled={isSaving} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Short Description (for card front)</Label>
            <Textarea id="description" {...register("description")} rows={3} disabled={isSaving} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

           <div className="space-y-1">
            <Label htmlFor="detailedDescription">Detailed Description (for card back)</Label>
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

          <DialogFooter className="pt-2">
             <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                 Cancel
             </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Service')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
