'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createNewsEvent, updateNewsEvent, NewsEvent } from '@/lib/mock-data';
import Image from 'next/image';

// Define Zod schema for validation
const newsSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  date: z.date({ required_error: "Date is required." }), // Use z.date for Calendar component
  summary: z.string().min(10, "Summary must be at least 10 characters long").max(200, "Summary cannot exceed 200 characters"),
  image: z.string().url("Image source must be a valid URL"),
  link: z.string().min(1, "Link slug is required (e.g., /news/my-article)").refine(val => val.startsWith('/'), { message: "Link must start with /"}), // Simple validation, adjust as needed
  hint: z.string().max(50, "AI hint should be concise (max 50 chars)").optional(),
});

// Type for form data based on schema
type NewsFormData = z.infer<typeof newsSchema>;

// Type for data expected/returned by mock-data functions (uses ISO string for date)
type NewsData = Omit<NewsEvent, 'id' | 'date'> & { date: string };

interface NewsFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: NewsEvent | null; // Item data for editing, null for adding
  onSuccess: (item: NewsEvent) => void; // Callback on successful save
}

export default function NewsFormDialog({ isOpen, setIsOpen, item, onSuccess }: NewsFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!item;

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      date: new Date(), // Default to today
      summary: '',
      image: '',
      link: '/news/',
      hint: '',
    }
  });

  const imageUrl = watch('image'); // Watch the image field for preview

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          title: item.title,
          date: parseISO(item.date), // Convert ISO string back to Date object
          summary: item.summary,
          image: item.image,
          link: item.link,
          hint: item.hint || '',
        });
      } else {
        reset({ // Reset to default values for adding new
          title: '',
          date: new Date(),
          summary: '',
          image: '',
          link: '/news/',
          hint: '',
        });
      }
    }
  }, [isOpen, item, reset]);

  const onSubmit: SubmitHandler<NewsFormData> = async (data) => {
    setIsSaving(true);
    // Convert Date object back to ISO string for mock data functions
     const dataToSave: NewsData = {
       ...data,
       date: data.date.toISOString(),
     };

    try {
      let savedItem: NewsEvent | null;
      if (isEditing && item) {
        savedItem = await updateNewsEvent(item.id, dataToSave);
        if (!savedItem) throw new Error("Update failed");
        toast({ title: "Success", description: "News item updated successfully." });
      } else {
        savedItem = await createNewsEvent(dataToSave);
        toast({ title: "Success", description: "News item created successfully." });
      }
      onSuccess(savedItem);
    } catch (error) {
       console.error("Save error:", error); // Log the error
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} news item. Please try again.`,
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

    // Basic URL validation for preview
   const isValidUrl = (url: string | undefined): boolean => {
     if (!url) return false;
     try {
       new URL(url);
       return true;
     } catch (_) {
       return false;
     }
   };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]"> {/* Wider dialog for more fields */}
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit News Item' : 'Add New News Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the news article or event.' : 'Enter the details for the new news item.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} disabled={isSaving} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

           {/* Date Picker */}
           <div className="space-y-1">
             <Label htmlFor="date">Date</Label>
             <Controller
               name="date"
               control={control}
               render={({ field }) => (
                 <Popover>
                   <PopoverTrigger asChild>
                     <Button
                       variant={"outline"}
                       className={cn(
                         "w-full justify-start text-left font-normal",
                         !field.value && "text-muted-foreground"
                       )}
                       disabled={isSaving}
                     >
                       <CalendarIcon className="mr-2 h-4 w-4" />
                       {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0">
                     <Calendar
                       mode="single"
                       selected={field.value}
                       onSelect={field.onChange}
                       initialFocus
                     />
                   </PopoverContent>
                 </Popover>
               )}
             />
             {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
           </div>


          {/* Summary */}
          <div className="space-y-1">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" {...register("summary")} rows={3} disabled={isSaving} />
            {errors.summary && <p className="text-sm text-destructive">{errors.summary.message}</p>}
          </div>

           {/* Image URL */}
          <div className="space-y-1">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" {...register("image")} placeholder="https://picsum.photos/400/250" disabled={isSaving} />
            {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
          </div>

          {/* Image Preview */}
          {isValidUrl(imageUrl) && (
            <div className="space-y-1">
              <Label>Image Preview</Label>
               <div className="relative h-32 w-full max-w-xs rounded border overflow-hidden bg-muted">
                 <Image
                   src={imageUrl!}
                   alt="News image preview"
                   layout="fill"
                   objectFit="cover"
                   unoptimized
                 />
               </div>
            </div>
           )}

          {/* Link Slug */}
          <div className="space-y-1">
            <Label htmlFor="link">Link Slug</Label>
            <Input id="link" {...register("link")} placeholder="/news/your-article-slug" disabled={isSaving} />
             <p className="text-xs text-muted-foreground">The part of the URL after your domain (must start with '/').</p>
            {errors.link && <p className="text-sm text-destructive">{errors.link.message}</p>}
          </div>

           {/* AI Hint */}
           <div className="space-y-1">
            <Label htmlFor="hint">AI Hint (Optional)</Label>
            <Input id="hint" {...register("hint")} placeholder="e.g., health camp" disabled={isSaving} />
             <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.hint && <p className="text-sm text-destructive">{errors.hint.message}</p>}
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Item')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
