
'use client';

import { useEffect, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { adSchema, type AdFormData } from '@/lib/schemas';
import type { Ad } from '@/lib/types';
import { createOrUpdateAd } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface AdFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ad?: Ad | null;
  onSuccess: (ad: Ad) => void;
}

const initialState = {
  success: false,
  message: '',
  ad: null,
};

export function AdForm({ isOpen, setIsOpen, ad, onSuccess }: AdFormProps) {
  const { toast } = useToast();
  const isEditing = !!ad;

  const form = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
    },
  });

  const [state, formAction] = useActionState(createOrUpdateAd, initialState);

  useEffect(() => {
    if (ad) {
      form.reset({
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        linkUrl: ad.linkUrl,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
      });
    }
  }, [ad, form, isOpen]);
  
  useEffect(() => {
    if (state.success && state.ad) {
      toast({
        title: `Success!`,
        description: `Advertisement ${isEditing ? 'updated' : 'created'}.`,
      });
      onSuccess(state.ad);
    } else if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, isEditing, onSuccess, toast]);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Advertisement</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this ad.' : 'Fill out the form to add a new ad.'}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 py-4">
          <input type="hidden" name="id" value={ad?.id || ''} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" placeholder="https://example.com/image.jpg" {...form.register('imageUrl')} />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL</Label>
            <Input id="linkUrl" placeholder="https://product.com/link" {...form.register('linkUrl')} />
            {form.formState.errors.linkUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.linkUrl.message}</p>
            )}
          </div>
           <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Ad'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

