'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { getServices, deleteService, Service } from '@/lib/mock-data';
import DynamicIcon from '@/lib/icons';
import ServiceFormDialog from './_components/service-form-dialog'; // Import the form dialog
import Image from 'next/image'; // Import for image previews

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState<string | null>(null); // Store ID of service being deleted
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchServicesData = async () => {
    setIsLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load services.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []); // Fetch data on mount

  const handleAddNew = () => {
    setSelectedService(null); // Ensure no service is selected for add new
    setIsFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsProcessingDelete(id); // Set the ID being deleted
    try {
      const success = await deleteService(id);
      if (success) {
        setServices(prev => prev.filter(s => s.id !== id));
        toast({
          title: "Success",
          description: "Service deleted successfully.",
        });
      } else {
        throw new Error("Service not found or delete failed.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDelete(null); // Clear the processing ID
    }
  };

   // Callback function for when the form is successfully submitted
   const handleFormSuccess = (savedService: Service) => {
     if (selectedService) {
       // Update existing service in the list
       setServices(prev => prev.map(s => s.id === savedService.id ? savedService : s));
     } else {
       // Add new service to the list
       setServices(prev => [savedService, ...prev]);
     }
     setIsFormOpen(false); // Close the dialog
     setSelectedService(null); // Reset selected service
   };

  const MemoizedTableBody = useMemo(() => (
     <TableBody>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => ( // Show 3 skeleton rows
            <TableRow key={`skeleton-${index}`}>
              <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              <TableCell><Skeleton className="h-10 w-16 rounded" /></TableCell>
              <TableCell className="text-right space-x-2">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
              </TableCell>
            </TableRow>
          ))
        ) : services.length === 0 ? (
          <TableRow>
             <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
               No services found. Add one to get started!
             </TableCell>
          </TableRow>
        ) : (
          services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>
                <DynamicIcon name={service.iconName || 'HelpCircle'} className="h-6 w-6 text-muted-foreground" />
              </TableCell>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell className="text-muted-foreground">{service.description}</TableCell>
              <TableCell className="w-[80px]">
                {service.imageUrl && (
                  <div className="relative h-10 w-16 rounded overflow-hidden border bg-muted">
                    <Image
                      src={service.imageUrl}
                      alt={`${service.name} image`}
                      fill={true} // Use fill instead of layout="fill"
                      style={{ objectFit: 'cover' }} // Use style for objectFit
                      unoptimized
                      onError={() => {
                        console.warn(`Failed to load image: ${service.imageUrl}`);
                      }}
                    />
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                 <Button variant="outline" size="icon" onClick={() => handleEdit(service)} aria-label={`Edit ${service.name}`}>
                   <Edit className="h-4 w-4" />
                 </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={isProcessingDelete === service.id} aria-label={`Delete ${service.name}`}>
                         {isProcessingDelete === service.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the service
                          "{service.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingDelete === service.id}>Cancel</AlertDialogCancel>
                         <AlertDialogAction
                            onClick={() => handleDelete(service.id)}
                            disabled={isProcessingDelete === service.id}
                            className="bg-destructive hover:bg-destructive/90"
                         >
                           {isProcessingDelete === service.id ? 'Deleting...' : 'Delete'}
                         </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
  ), [isLoading, services, isProcessingDelete, handleEdit, handleDelete]); // Dependencies for useMemo


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
           <div>
             <CardTitle>Manage Services</CardTitle>
             <CardDescription>Add, edit, or delete hospital services.</CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Icon</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
           {MemoizedTableBody}
        </Table>
      </CardContent>

      {/* Form Dialog */}
      <ServiceFormDialog
         isOpen={isFormOpen}
         setIsOpen={setIsFormOpen}
         service={selectedService}
         onSuccess={handleFormSuccess}
      />
    </Card>
  );
}

