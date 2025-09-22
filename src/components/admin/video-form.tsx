
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { videoSchema, type VideoFormData } from '@/lib/schemas';
import type { Video } from '@/lib/types';
import { createOrUpdateVideo } from '@/lib/actions';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

type SerializableVideo = Omit<Video, 'createdAt'> & { createdAt: string };

interface VideoFormProps {
  video?: SerializableVideo | null;
  onSuccess?: () => void;
}

const initialState = {
    success: false,
    message: '',
    video: null,
};

export function VideoForm({ video, onSuccess }: VideoFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!video;

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: video ? {
        title: video.title,
        youtubeUrl: video.youtubeUrl,
    } : {
      title: '',
      youtubeUrl: '',
    },
  });

  const [state, formAction] = useFormState(createOrUpdateVideo, initialState);

  useEffect(() => {
    if (state.success && state.video) {
      toast({
        title: `Success!`,
        description: `Video ${isEditing ? 'updated' : 'created'}.`,
      });
      router.refresh();
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Saving...' : 'Save Video'}
            </Button>
        </DialogFooter>
    </form>
  );
}
