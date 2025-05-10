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
import NextImage from 'next/image'; // Using NextImage to avoid conflict if 'Image' is a Lucide icon

// Define Zod schema for validation
const newsSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  date: z.date({ required_error: "Date is required." }),
  summary: z.string().min(10, "Summary must be at least 10 characters long").max(200, "Summary cannot exceed 200 characters"),
  fullContent: z.string().min(50, "Full content must be at least 50 characters long"),
  image: z.string().min(1, "Image source is required.").refine(value => 
    value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image'), 
    { message: "Must be a valid URL or an uploaded image." }
  ),
  link: z.string().min(1, "Link slug is required (e.g., /news/my-article)").refine(val => val.startsWith('/'), { message: "Link must start with /"}),
  hint: z.string().max(50, "AI hint should be concise (max 50 chars)").optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;
// Type for data sent to mock DB (date as string)
type NewsDataForDb = Omit<NewsEvent, 'id' | 'date'> & { date: string };


interface NewsFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: NewsEvent | null;
  onSuccess: (item: NewsEvent) => void;
}

export default function NewsFormDialog({ isOpen, setIsOpen, item, onSuccess }: NewsFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!item;
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      date: new Date(),
      summary: '',
      fullContent: '',
      image: '',
      link: '/news/',
      hint: '',
    }
  });

  const watchedImage = watch('image');

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          title: item.title,
          date: parseISO(item.date), // Parse ISO string back to Date object
          summary: item.summary,
          fullContent: item.fullContent,
          image: item.image,
          link: item.link,
          hint: item.hint || '',
        });
        setImagePreview(item.image);
      } else {
        reset({
          title: '',
          date: new Date(),
          summary: '',
          fullContent: '',
          image: '',
          link: '/news/',
          hint: '',
        });
        setImagePreview(undefined);
      }
      setFileName(undefined);
    }
  }, [isOpen, item, reset]);

  useEffect(() => {
    setImagePreview(watchedImage);
  }, [watchedImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue('image', dataUri, { shouldValidate: true });
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(undefined);
    }
  };

  const onSubmit: SubmitHandler<NewsFormData> = async (data) => {
    setIsSaving(true);
     const dataToSave: NewsDataForDb = {
       ...data,
       date: data.date.toISOString(), // Convert Date object to ISO string for storage
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
      setFileName(undefined);
    } catch (error) {
       console.error("Save error:", error);
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
      setImagePreview(undefined);
      setFileName(undefined);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit News Item' : 'Add New News Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the news article or event.' : 'Enter the details for the new news item.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} disabled={isSaving} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

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

          <div className="space-y-1">
            <Label htmlFor="summary">Summary (Short)</Label>
            <Textarea id="summary" {...register("summary")} rows={3} disabled={isSaving} />
            {errors.summary && <p className="text-sm text-destructive">{errors.summary.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="fullContent">Full Content</Label>
            <Textarea id="fullContent" {...register("fullContent")} rows={8} disabled={isSaving} placeholder="Enter the full content of the news or event..."/>
            {errors.fullContent && <p className="text-sm text-destructive">{errors.fullContent.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="image">Image URL</Label>
            <Input 
              id="image" 
              {...register("image")} 
              placeholder="https://picsum.photos/400/250 or leave blank to upload" 
              disabled={isSaving}
              onChange={(e) => {
                setValue("image", e.target.value, { shouldValidate: true });
                setImagePreview(e.target.value);
                setFileName(undefined);
              }}
            />
            {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="imageUpload">Or Upload Image</Label>
            <Input 
              id="imageUpload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={isSaving}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {fileName && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}
          </div>

          {imagePreview && (
            <div className="space-y-1">
              <Label>Image Preview</Label>
               <div className="relative h-32 w-full max-w-xs rounded border overflow-hidden bg-muted">
                 <NextImage
                   src={imagePreview}
                   alt="News image preview"
                   layout="fill"
                   objectFit="cover"
                   unoptimized
                 />
               </div>
            </div>
           )}

          <div className="space-y-1">
            <Label htmlFor="link">Link Slug (Unique)</Label>
            <Input id="link" {...register("link")} placeholder="/news/your-unique-article-slug" disabled={isSaving} />
             <p className="text-xs text-muted-foreground">Unique part of the URL after domain (must start with '/'). E.g., /news/health-camp-2024</p>
            {errors.link && <p className="text-sm text-destructive">{errors.link.message}</p>}
          </div>

           <div className="space-y-1">
            <Label htmlFor="hint">AI Hint (Optional)</Label>
            <Input id="hint" {...register("hint")} placeholder="e.g., health camp" disabled={isSaving} />
             <p className="text-xs text-muted-foreground">Keywords for AI image search (max 2 words).</p>
            {errors.hint && <p className="text-sm text-destructive">{errors.hint.message}</p>}
          </div>

          <DialogFooter className="pt-4">
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
