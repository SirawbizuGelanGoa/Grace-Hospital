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
import { PlusCircle, Edit, Trash2, Loader2, UserRound } from 'lucide-react';
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
import { getDepartments, deleteDepartment, Department } from '@/lib/mock-data';
import Image from 'next/image'; // Import for image previews
import DepartmentFormDialog from './_components/department-form-dialog'; // Import the form dialog

export default function ManageDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchDepartmentsData = async () => {
    setIsLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load departments.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  const handleAddNew = () => {
    setSelectedDepartment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsProcessingDelete(id);
    try {
      const success = await deleteDepartment(id);
      if (success) {
        setDepartments(prev => prev.filter(department => department.id !== id));
        toast({
          title: "Success",
          description: "Department deleted successfully.",
        });
      } else {
        throw new Error("Department not found or delete failed.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDelete(null);
    }
  };

   const handleFormSuccess = (savedDepartment: Department) => {
     if (selectedDepartment) {
       setDepartments(prev => prev.map(department => department.id === savedDepartment.id ? savedDepartment : department));
     } else {
       setDepartments(prev => [savedDepartment, ...prev]);
     }
     setIsFormOpen(false);
     setSelectedDepartment(null);
   };

  const MemoizedTableBody = useMemo(() => (
     <TableBody>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell><Skeleton className="h-10 w-16 rounded" /></TableCell>
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-right space-x-2">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
              </TableCell>
            </TableRow>
          ))
        ) : departments.length === 0 ? (
            <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No departments found. Add one to get started!
                </TableCell>
            </TableRow>
        ) : (
          departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className="w-[80px]">
                {department.imageUrl ? (
                  <div className="relative h-10 w-16 rounded overflow-hidden border bg-muted">
                    <Image
                      src={department.imageUrl}
                      alt={department.name || 'Department thumbnail'}
                      fill={true} // Use fill instead of layout="fill"
                      style={{ objectFit: 'cover' }} // Use style for objectFit
                      unoptimized
                      onError={() => {
                        console.warn(`Failed to load image: ${department.imageUrl}`);
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-10 w-16 rounded border bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium w-[200px] truncate">{department.name}</TableCell>
              <TableCell className="text-muted-foreground text-xs truncate max-w-[300px]">{department.description}</TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {department.headDoctor ? (
                  <div className="flex items-center">
                    <UserRound className="h-3 w-3 mr-1" />
                    {department.headDoctor}
                  </div>
                ) : 'N/A'}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">{department.hint || 'N/A'}</TableCell>
              <TableCell className="text-right space-x-2 w-[120px]">
                 <Button variant="outline" size="icon" onClick={() => handleEdit(department)} aria-label={`Edit ${department.name}`}>
                   <Edit className="h-4 w-4" />
                 </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={isProcessingDelete === department.id} aria-label={`Delete ${department.name}`}>
                         {isProcessingDelete === department.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the department
                          "{department.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingDelete === department.id}>Cancel</AlertDialogCancel>
                         <AlertDialogAction
                            onClick={() => handleDelete(department.id)}
                            disabled={isProcessingDelete === department.id}
                            className="bg-destructive hover:bg-destructive/90"
                         >
                           {isProcessingDelete === department.id ? 'Deleting...' : 'Delete'}
                         </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
  ), [isLoading, departments, isProcessingDelete, handleEdit, handleDelete]);


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
           <div>
             <CardTitle>Manage Departments</CardTitle>
             <CardDescription>Add, edit, or delete hospital departments and their details.</CardDescription>
           </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Department
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
              <TableHead>Head Doctor</TableHead>
              <TableHead>AI Hint</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
           {MemoizedTableBody}
        </Table>
      </CardContent>

      <DepartmentFormDialog
         isOpen={isFormOpen}
         setIsOpen={setIsFormOpen}
         department={selectedDepartment}
         onSuccess={handleFormSuccess}
      />
    </Card>
  );
}

