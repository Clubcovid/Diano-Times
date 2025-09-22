
'use client';

import { useState } from 'react';
import type { Video } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VideoForm } from './video-form';

type SerializableVideo = Omit<Video, 'createdAt'> & { createdAt: string };

interface VideoFormDialogProps {
  video?: SerializableVideo | null;
  children: React.ReactNode;
}

export function VideoFormDialog({ video, children }: VideoFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!video;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Video</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this video.' : 'Fill out the form to add a new video.'}
          </DialogDescription>
        </DialogHeader>
        <VideoForm video={video} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
