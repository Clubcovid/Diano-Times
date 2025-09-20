
import { PlusCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Video } from '@/lib/types';
import { getVideos } from '@/lib/actions';
import { VideoFormDialog } from '@/components/admin/video-form-dialog';
import { VideoCard } from '@/components/admin/video-card';


// Helper function to serialize Firestore Timestamps
const serializeVideos = (videos: Video[]): any[] => {
    return videos.map(video => ({
        ...video,
        createdAt: video.createdAt?.toDate ? video.createdAt.toDate().toISOString() : new Date().toISOString(),
    }));
};

export default async function VideosPage() {
  const videos = await getVideos();
  const serializableVideos = serializeVideos(videos);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Videos</h1>
            <p className="text-muted-foreground">Manage your YouTube videos.</p>
          </div>
          <VideoFormDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Video
            </Button>
          </VideoFormDialog>
        </div>

        {videos.length === 0 ? (
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
            {serializableVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
