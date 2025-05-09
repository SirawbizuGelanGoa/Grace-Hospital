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
import { PlusCircle, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
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
import { getHeroSlides, deleteHeroSlide, HeroSlide } from '@/lib/mock-data';
import NextImage from 'next/image'; // Use next/image for previews
import HeroSlideFormDialog from './_components/hero-slide-form-dialog';

export default function ManageHeroSlidesPage() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchHeroSlidesData = async () => {
    setIsLoading(true);
    try {
      const data = await getHeroSlides();
      setHeroSlides(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load hero slides.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSlidesData();
  }, []);

  const handleAddNew = () => {
    setSelectedSlide(null);
    setIsFormOpen(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsProcessingDelete(id);
    try {
      const success = await deleteHeroSlide(id);
      if (success) {
        setHeroSlides(prev => prev.filter(slide => slide.id !== id));
        toast({
          title: "Success",
          description: "Hero slide deleted successfully.",
        });
      } else {
        throw new Error("Hero slide not found or delete failed.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete hero slide. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDelete(null);
    }
  };

   const handleFormSuccess = (savedSlide: HeroSlide) => {
     if (selectedSlide) {
       setHeroSlides(prev => prev.map(slide => slide.id === savedSlide.id ? savedSlide : slide));
     } else {
       setHeroSlides(prev => [savedSlide, ...prev]);
     }
     setIsFormOpen(false);
     setSelectedSlide(null);
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
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-right space-x-2">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
              </TableCell>
            </TableRow>
          ))
        ) : heroSlides.length === 0 ? (
            <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hero slides found. Add one to get started!
                </TableCell>
            </TableRow>
        ) : (
          heroSlides.map((slide) => (
            <TableRow key={slide.id}>
              <TableCell className="w-[80px]">
                <div className="relative h-10 w-16 rounded overflow-hidden border bg-muted">
                  <NextImage
                    src={slide.src}
                    alt={slide.alt || 'Hero slide thumbnail'}
                    layout="fill"
                    objectFit="cover"
                    unoptimized
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium w-[200px] truncate">{slide.alt}</TableCell>
              <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">{slide.title || 'N/A'}</TableCell>
              <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">{slide.subtitle || 'N/A'}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{slide.hint || 'N/A'}</TableCell>
              <TableCell className="text-right space-x-2 w-[120px]">
                 <Button variant="outline" size="icon" onClick={() => handleEdit(slide)} aria-label={`Edit ${slide.alt}`}>
                   <Edit className="h-4 w-4" />
                 </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={isProcessingDelete === slide.id} aria-label={`Delete ${slide.alt}`}>
                         {isProcessingDelete === slide.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the hero slide
                          "{slide.alt}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingDelete === slide.id}>Cancel</AlertDialogCancel>
                         <AlertDialogAction
                            onClick={() => handleDelete(slide.id)}
                            disabled={isProcessingDelete === slide.id}
                            className="bg-destructive hover:bg-destructive/90"
                         >
                           {isProcessingDelete === slide.id ? 'Deleting...' : 'Delete'}
                         </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
  ), [isLoading, heroSlides, isProcessingDelete, handleEdit, handleDelete]);


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
           <div>
             <CardTitle>Manage Hero Slides</CardTitle>
             <CardDescription>Add, edit, or delete images for the homepage hero carousel.</CardDescription>
           </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Slide
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Alt Text</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Subtitle</TableHead>
              <TableHead>AI Hint</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
           {MemoizedTableBody}
        </Table>
      </CardContent>

      <HeroSlideFormDialog
         isOpen={isFormOpen}
         setIsOpen={setIsFormOpen}
         slide={selectedSlide}
         onSuccess={handleFormSuccess}
      />
    </Card>
  );
}
