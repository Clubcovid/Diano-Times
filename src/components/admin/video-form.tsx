
'use client';

import { useEffect, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { videoSchema, type VideoFormData } from '@/lib/schemas';
import type { Video } from '@/lib/types';
import { createOrUpdateVideo } from '@/lib/actions';
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
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface VideoFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  video?: Video | null;
  onSuccess: (video: Video) => void;
}

const initialState = {
    success: false,
    message: '',
    video: null,
};

export function VideoForm({ isOpen, setIsOpen, video, onSuccess }: VideoFormProps) {
  const { toast } = useToast();
  const isEditing = !!video;

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: '',
      youtubeUrl: '',
    },
  });

  const [state, formAction] = useActionState(createOrUpdateVideo, initialState);

  useEffect(() => {
    if (video) {
      form.reset({
        title: video.title,
        youtubeUrl: video.youtubeUrl,
      });
    } else {
      form.reset({
        title: '',
        youtubeUrl: '',
      });
    }
  }, [video, form, isOpen]);

  useEffect(() => {
    if (state.success && state.video) {
      toast({
        title: `Success!`,
        description: `Video ${isEditing ? 'updated' : 'created'}.`,
      });
      onSuccess(state.video);
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
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Video</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this video.' : 'Fill out the form to add a new video.'}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 py-4">
          <input type="hidden" name="id" value={video?.id || ''} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube URL</Label>
            <Input id="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." {...form.register('youtubeUrl')} />
            {form.formState.errors.youtubeUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.youtubeUrl.message}</p>
            )}
          </div>
           <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Video'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

