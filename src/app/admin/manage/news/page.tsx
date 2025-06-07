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
import { PlusCircle, Edit, Trash2, Loader2, Calendar } from 'lucide-react';
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
import { getNewsItems, deleteNewsItem, NewsItem } from '@/lib/mock-data';
import { format } from 'date-fns';
import Image from 'next/image'; // Import for image previews
import NewsFormDialog from './_components/news-form-dialog'; // Import the form dialog

export default function ManageNewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState<string | null>(null);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchNewsData = async () => {
    setIsLoading(true);
    try {
      const data = await getNewsItems();
      setNewsItems(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load news items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, []);

  const handleAddNew = () => {
    setSelectedNewsItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (newsItem: NewsItem) => {
    setSelectedNewsItem(newsItem);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsProcessingDelete(id);
    try {
      const success = await deleteNewsItem(id);
      if (success) {
        setNewsItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Success",
          description: "News item deleted successfully.",
        });
      } else {
        throw new Error("News item not found or delete failed.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete news item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDelete(null);
    }
  };

   const handleFormSuccess = (savedNewsItem: NewsItem) => {
     if (selectedNewsItem) {
       setNewsItems(prev => prev.map(item => item.id === savedNewsItem.id ? savedNewsItem : item));
     } else {
       setNewsItems(prev => [savedNewsItem, ...prev]);
     }
     setIsFormOpen(false);
     setSelectedNewsItem(null);
   };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
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
        ) : newsItems.length === 0 ? (
            <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No news items found. Add one to get started!
                </TableCell>
            </TableRow>
        ) : (
          newsItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="w-[80px]">
                {item.imageUrl ? (
                  <div className="relative h-10 w-16 rounded overflow-hidden border bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.title || 'News thumbnail'}
                      fill={true} // Use fill instead of layout="fill"
                      style={{ objectFit: 'cover' }} // Use style for objectFit
                      unoptimized
                      onError={() => {
                        console.warn(`Failed to load image: ${item.imageUrl}`);
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-10 w-16 rounded border bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium w-[250px] truncate">{item.title}</TableCell>
              <TableCell className="text-muted-foreground text-xs truncate max-w-[300px]">{item.content}</TableCell>
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                <Calendar className="h-3 w-3 inline-block mr-1" />
                {formatDate(item.date)}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">{item.author || 'N/A'}</TableCell>
              <TableCell className="text-right space-x-2 w-[120px]">
                 <Button variant="outline" size="icon" onClick={() => handleEdit(item)} aria-label={`Edit ${item.title}`}>
                   <Edit className="h-4 w-4" />
                 </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={isProcessingDelete === item.id} aria-label={`Delete ${item.title}`}>
                         {isProcessingDelete === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the news item
                          "{item.title}".
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
  ), [isLoading, newsItems, isProcessingDelete, handleEdit, handleDelete]);


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
           <div>
             <CardTitle>Manage News</CardTitle>
             <CardDescription>Add, edit, or delete news items displayed on the website.</CardDescription>
           </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add News Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
           {MemoizedTableBody}
        </Table>
      </CardContent>

      <NewsFormDialog
         isOpen={isFormOpen}
         setIsOpen={setIsFormOpen}
         newsItem={selectedNewsItem}
         onSuccess={handleFormSuccess}
      />
    </Card>
  );
}

