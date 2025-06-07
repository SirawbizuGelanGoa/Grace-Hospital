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
import { getFacilities, deleteFacility, Facility } from '@/lib/mock-data';
import Image from 'next/image'; // Import for image previews
import FacilityFormDialog from './_components/facility-form-dialog'; // Import the form dialog

export default function ManageFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchFacilitiesData = async () => {
    setIsLoading(true);
    try {
      const data = await getFacilities();
      setFacilities(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load facilities.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilitiesData();
  }, []);

  const handleAddNew = () => {
    setSelectedFacility(null);
    setIsFormOpen(true);
  };

  const handleEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsProcessingDelete(id);
    try {
      const success = await deleteFacility(id);
      if (success) {
        setFacilities(prev => prev.filter(facility => facility.id !== id));
        toast({
          title: "Success",
          description: "Facility deleted successfully.",
        });
      } else {
        throw new Error("Facility not found or delete failed.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete facility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDelete(null);
    }
  };

   const handleFormSuccess = (savedFacility: Facility) => {
     if (selectedFacility) {
       setFacilities(prev => prev.map(facility => facility.id === savedFacility.id ? savedFacility : facility));
     } else {
       setFacilities(prev => [savedFacility, ...prev]);
     }
     setIsFormOpen(false);
     setSelectedFacility(null);
   };

  const MemoizedTableBody = useMemo(() => (
     <TableBody>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell><Skeleton className="h-10 w-16 rounded" /></TableCell>
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-right space-x-2">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
              </TableCell>
            </TableRow>
          ))
        ) : facilities.length === 0 ? (
            <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No facilities found. Add one to get started!
                </TableCell>
            </TableRow>
        ) : (
          facilities.map((facility) => (
            <TableRow key={facility.id}>
              <TableCell className="w-[80px]">
                {facility.imageUrl ? (
                  <div className="relative h-10 w-16 rounded overflow-hidden border bg-muted">
                    <Image
                      src={facility.imageUrl}
                      alt={facility.name || 'Facility thumbnail'}
                      fill={true} // Use fill instead of layout="fill"
                      style={{ objectFit: 'cover' }} // Use style for objectFit
                      unoptimized
                      onError={() => {
                        console.warn(`Failed to load image: ${facility.imageUrl}`);
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-10 w-16 rounded border bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium w-[200px] truncate">{facility.name}</TableCell>
              <TableCell className="text-muted-foreground text-xs truncate max-w-[400px]">{facility.description}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{facility.hint || 'N/A'}</TableCell>
              <TableCell className="text-right space-x-2 w-[120px]">
                 <Button variant="outline" size="icon" onClick={() => handleEdit(facility)} aria-label={`Edit ${facility.name}`}>
                   <Edit className="h-4 w-4" />
                 </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={isProcessingDelete === facility.id} aria-label={`Delete ${facility.name}`}>
                         {isProcessingDelete === facility.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the facility
                          "{facility.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingDelete === facility.id}>Cancel</AlertDialogCancel>
                         <AlertDialogAction
                            onClick={() => handleDelete(facility.id)}
                            disabled={isProcessingDelete === facility.id}
                            className="bg-destructive hover:bg-destructive/90"
                         >
                           {isProcessingDelete === facility.id ? 'Deleting...' : 'Delete'}
                         </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
  ), [isLoading, facilities, isProcessingDelete, handleEdit, handleDelete]);


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
           <div>
             <CardTitle>Manage Facilities</CardTitle>
             <CardDescription>Add, edit, or delete hospital facilities and equipment.</CardDescription>
           </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Facility
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>AI Hint</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
           {MemoizedTableBody}
        </Table>
      </CardContent>

      <FacilityFormDialog
         isOpen={isFormOpen}
         setIsOpen={setIsFormOpen}
         facility={selectedFacility}
         onSuccess={handleFormSuccess}
      />
    </Card>
  );
}

