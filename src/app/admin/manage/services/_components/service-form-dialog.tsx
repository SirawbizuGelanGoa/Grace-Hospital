
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
import { useToast } from "@/hooks/use-toast";
// import { createService, updateService, Service } from '@/lib/mock-data'; // Removed mock-data import
import DynamicIcon from '@/lib/icons'; // Removed availableIconNames import

// Define Zod schema for validation
const serviceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Short description must be at least 10 characters long").max(150, "Short description cannot exceed 150 characters"),
  detailedDescription: z.string().min(20, "Detailed description must be at least 20 characters long"),
  iconName: z.string().min(1, "Icon name is required"), // Changed to required
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface Service {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  iconName: string;
}

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

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      detailedDescription: '',
      iconName: 'HelpCircle', // Default to HelpCircle icon
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
            iconName: service.iconName || 'HelpCircle',
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
       let savedService: Service;
       if (isEditing && service) {
        const response = await fetch(`/api/services/${service.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Update failed");
        savedService = await response.json();
        toast({ title: "Success", description: "Service updated successfully." });
      } else {
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Creation failed");
        savedService = await response.json();
        toast({ title: "Success", description: "Service created successfully." });
      }
      onSuccess(savedService); 
      setIsOpen(false); // Close dialog on success
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} service. ${error.message || 'Please try again.'}`,
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
             <Label htmlFor="iconName">Icon Name</Label>
             <Input 
                id="iconName" 
                {...register("iconName")} 
                placeholder="e.g., Home, Settings, User" 
                disabled={isSaving}
              />
              {errors.iconName && <p className="text-sm text-destructive">{errors.iconName.message}</p>}
              <p className="text-xs text-muted-foreground">Enter a Lucide React icon name (e.g., 'HelpCircle', 'Home').</p>
              {selectedIconName && (
                <div className="space-y-1 mt-2">
                  <Label>Icon Preview</Label>
                  <div className="flex items-center justify-center h-16 w-16 rounded border bg-muted">
                    <DynamicIcon name={selectedIconName} className="h-8 w-8" />
                  </div>
                </div>
              )}
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


