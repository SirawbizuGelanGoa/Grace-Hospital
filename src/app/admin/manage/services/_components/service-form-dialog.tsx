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
  DialogClose, // Keep DialogClose for manual closing if needed, though controlled state is preferred
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

// Generate list of valid Lucide icon names (excluding certain types if necessary)
const availableIconNames = Object.keys(LucideIcons).filter(key =>
    key !== 'createLucideIcon' && key !== 'LucideIcon' && typeof LucideIcons[key as keyof typeof LucideIcons] !== 'string' && !key.includes('Provider') // Exclude helper functions/types
).sort();


// Define Zod schema for validation
const serviceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  iconName: z.string().refine(val => availableIconNames.includes(val), {
       message: "Please select a valid icon",
   }), // Ensure iconName is one of the available Lucide icons
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  service: Service | null; // Service data for editing, null for adding
  onSuccess: (service: Service) => void; // Callback on successful save
}

export default function ServiceFormDialog({ isOpen, setIsOpen, service, onSuccess }: ServiceFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!service;

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      iconName: 'HelpCircle', // Default icon
    }
  });

  const selectedIconName = watch("iconName"); // Watch the iconName field for preview

  // Reset form when dialog opens or service changes
  useEffect(() => {
    if (isOpen) {
      if (service) {
        reset({
            name: service.name,
            description: service.description,
            iconName: availableIconNames.includes(service.iconName) ? service.iconName : 'HelpCircle', // Validate icon name
        });
      } else {
        reset({ // Reset to default values for adding new
            name: '',
            description: '',
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
        // Update existing service
        savedService = await updateService(service.id, data);
        if (!savedService) throw new Error("Update failed");
        toast({ title: "Success", description: "Service updated successfully." });
      } else {
        // Create new service
        savedService = await createService(data);
        toast({ title: "Success", description: "Service created successfully." });
      }
      onSuccess(savedService); // Call the success callback
      // setIsOpen(false); // Dialog will be closed by the parent via onSuccess -> setIsOpen(false)
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

  // Handle manual closing or clicking overlay
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        reset(); // Reset form if dialog is closed without saving
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
           {/* Service Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Service Name</Label>
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
                       <ScrollArea className="h-[250px]"> {/* Make dropdown scrollable */}
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
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Service')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
