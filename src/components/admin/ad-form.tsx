
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { adSchema, type AdFormData } from '@/lib/schemas';
import { createOrUpdateAd } from '@/lib/actions';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Ad } from '@/lib/types';

type SerializableAd = Omit<Ad, 'createdAt'> & { createdAt: string };

interface AdFormProps {
  ad?: SerializableAd | null;
  onSuccess?: () => void;
}

export function AdForm({ ad, onSuccess }: AdFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!ad;

  const form = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: ad ? {
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
    } : {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
    },
  });

  const [state, formAction] = useFormState(createOrUpdateAd, { success: false, message: '', ad: null });

  useEffect(() => {
    if (state.success && state.ad) {
      toast({
        title: `Success!`,
        description: `Advertisement ${isEditing ? 'updated' : 'created'}.`,
      });
      router.refresh(); // Re-fetch server-side props
      onSuccess?.();
    } else if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, isEditing, onSuccess, toast, router]);


  return (
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Saving...' : 'Save Ad'}
            </Button>
        </DialogFooter>
    </form>
  );
}
