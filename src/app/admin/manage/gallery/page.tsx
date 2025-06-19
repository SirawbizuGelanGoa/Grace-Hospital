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
import { PlusCircle, Edit, Trash2, Loader2, Image as ImageIcon, Video } from 'lucide-react';
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
import { getGalleryItems, deleteGalleryItem, GalleryItem } from '@/lib/mock-data';
import Image from 'next/image'; // Use next/image for previews
import GalleryFormDialog from './_components/gallery-form-dialog'; // Import the form dialog

export default function ManageGalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchGalleryData = async () => {
    setIsLoading(true);
    try {
      const data = await getGalleryItems();
      setGalleryItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load gallery items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsProcessingDelete(id);
    try {
      const success = await deleteGalleryItem(id);
      if (success) {
        setGalleryItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Success",
          description: "Gallery item deleted successfully.",
        });
      } else {
        throw new Error("Gallery item not found or delete failed.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete gallery item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDelete(null);
    }
  };

   const handleFormSuccess = (savedItem: GalleryItem) => {
     if (selectedItem) {
       setGalleryItems(prev => prev.map(item => item.id === savedItem.id ? savedItem : item));
     } else {
       // Add new items to the beginning for visibility
       setGalleryItems(prev => [savedItem, ...prev]);
     }
     setIsFormOpen(false);
     setSelectedItem(null);
   };

  const MemoizedTableBody = useMemo(() => (
     <TableBody>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => ( // Show 4 skeleton rows for gallery
            <TableRow key={`skeleton-${index}`}>
              <TableCell><Skeleton className="h-10 w-16 rounded" /></TableCell>
              <TableCell><Skeleton className="h-5 w-8" /></TableCell>
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
               <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-right space-x-2">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
              </TableCell>
            </TableRow>
          ))
        ) : galleryItems.length === 0 ? (
            <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No gallery items found. Add photos or videos to get started!
                </TableCell>
            </TableRow>
        ) : (
          galleryItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="w-[80px]">
                <div className="relative h-10 w-16 rounded overflow-hidden border">
                  {item.type === 'photo' ? (
                    <Image
                      src={item.src}
                      alt={item.alt || 'Gallery thumbnail'}
                      fill={true}
                      style={{ objectFit: 'cover' }}
                      unoptimized
                      onError={() => {
                        console.warn(`Failed to load image: ${item.src}`);
                      }}
                    />
                  ) : (
                    <div className="relative h-full w-full bg-black flex items-center justify-center">
                      {/* Fixed: Use regular img tag for video thumbnails instead of Next.js Image component */}
                      {/* This prevents Next.js from trying to optimize video files as images */}
                      <img
                        src={item.src}
                        alt={item.alt || 'Video thumbnail'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.warn(`Failed to load video thumbnail: ${item.src}`);
                          // Fallback to a placeholder or hide the image
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Video className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
               <TableCell className="w-[80px] capitalize">
                  {item.type === 'photo' ? <ImageIcon className="h-5 w-5 text-muted-foreground inline-block mr-1"/> : <Video className="h-5 w-5 text-muted-foreground inline-block mr-1"/>}
                  {item.type}
              </TableCell>
              <TableCell className="font-medium w-[250px] truncate">{item.alt}</TableCell>
              <TableCell className="text-muted-foreground text-xs truncate max-w-[300px]">{item.src}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{item.hint || 'N/A'}</TableCell>
              <TableCell className="text-right space-x-2 w-[120px]">
                 <Button variant="outline" size="icon" onClick={() => handleEdit(item)} aria-label={`Edit ${item.alt}`}>
                   <Edit className="h-4 w-4" />
                 </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={isProcessingDelete === item.id} aria-label={`Delete ${item.alt}`}>
                         {isProcessingDelete === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the gallery item
                          "{item.alt}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessingDelete === item.id}>Cancel</AlertDialogCancel>
                         <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            disabled={isProcessingDelete === item.id}
                            className="bg-destructive hover:bg-destructive/90"
                         >
                           {isProcessingDelete === item.id ? 'Deleting...' : 'Delete'}
                         </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
  ), [isLoading, galleryItems, isProcessingDelete, handleEdit, handleDelete]);


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
           <div>
             <CardTitle>Manage Gallery</CardTitle>
             <CardDescription>Add, edit, or delete photos and videos displayed on the website.</CardDescription>
           </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
               <TableHead>Type</TableHead>
              <TableHead>Alt Text</TableHead>
              <TableHead>Source URL</TableHead>
               <TableHead>AI Hint</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
           {MemoizedTableBody}
        </Table>
      </CardContent>

      <GalleryFormDialog
         isOpen={isFormOpen}
         setIsOpen={setIsFormOpen}
         item={selectedItem}
         onSuccess={handleFormSuccess}
      />
    </Card>
  );
}

