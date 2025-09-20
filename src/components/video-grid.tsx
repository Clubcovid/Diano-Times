'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Video } from '@/lib/types';

type SerializableVideo = Omit<Video, 'createdAt'> & { createdAt: string };

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function VideoGrid({ videos }: { videos: SerializableVideo[] }) {
  const [selectedVideo, setSelectedVideo] = useState<SerializableVideo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleVideoClick = (video: SerializableVideo) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedVideo(null);
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 col-span-full">
        <h2 className="text-2xl font-bold font-headline">No Videos Yet</h2>
        <p className="text-muted-foreground mt-2">
          Our video section is ready. Check back later for new content!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => {
          const videoId = getYouTubeId(video.youtubeUrl);
          if (!videoId) return null;

          return (
            <div
              key={video.id}
              className="flex flex-col group overflow-hidden rounded-lg border cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white/80 transform transition-transform group-hover:scale-110" />
                </div>
              </div>
              <div className="p-4 bg-card">
                <h3 className="font-headline text-lg leading-snug">
                  {video.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl p-0 border-0">
          <div className="aspect-video">
            {selectedVideo && (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.youtubeUrl)}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
