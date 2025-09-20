
'use client';

import { useState, useTransition, useEffect } from 'react';
import { PlusCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoForm } from '@/components/admin/video-form';
import type { Video } from '@/lib/types';
import { getVideos, deleteVideo } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true);
      const fetchedVideos = await getVideos();
      const serializableVideos = fetchedVideos.map(video => ({
          ...video,
          createdAt: video.createdAt?.toDate ? video.createdAt.toDate().toISOString() : new Date().toISOString()
      }));
      setVideos(serializableVideos);
      setIsLoading(false);
    }
    fetchVideos();
  }, []);

  const handleFormSuccess = (updatedVideo: Video) => {
    const isNew = !videos.some(video => video.id === updatedVideo.id);
    const serializableVideo = {
        ...updatedVideo,
        createdAt: updatedVideo.createdAt?.toDate ? updatedVideo.createdAt.toDate().toISOString() : new Date().toISOString()
    };

    if (isNew) {
      setVideos((prev) => [serializableVideo, ...prev]);
    } else {
      setVideos((prev) => prev.map((video) => (video.id === serializableVideo.id ? serializableVideo : video)));
    }
    setIsFormOpen(false);
    setSelectedVideo(null);
  };

  const handleEdit = (video: Video) => {
    setSelectedVideo(video);
    setIsFormOpen(true);
  };

  const handleDelete = (videoId: string) => {
    setVideoToDelete(videoId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!videoToDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteVideo(videoToDelete);
      if (result.success) {
        toast({ title: 'Success', description: 'Video deleted.' });
        setVideos((prev) => prev.filter((video) => video.id !== videoToDelete));
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setShowDeleteDialog(false);
      setVideoToDelete(null);
    });
  };

    function getYouTubeId(url: string) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }


  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Videos</h1>
            <p className="text-muted-foreground">Manage your YouTube videos.</p>
          </div>
          <Button
            onClick={() => {
              setSelectedVideo(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Video
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted rounded" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold">No videos found.</h3>
              <p className="text-muted-foreground mt-2">
                Click "Add New Video" to add your first one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const videoId = getYouTubeId(video.youtubeUrl);
              return (
              <Card key={video.id}>
                <CardHeader className="p-0">
                  <div className="relative">
                     <div className="aspect-video relative rounded-t-lg overflow-hidden bg-black">
                        {videoId && (
                             <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        )}
                    </div>
                    <div className="absolute top-2 right-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(video)}>
                                    <Pencil className="mr-2 h-4 w-4"/>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(video.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="text-lg font-headline">{video.title}</CardTitle>
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </div>

      <VideoForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        video={selectedVideo}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this video entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
