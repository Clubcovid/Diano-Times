
import { PlusCircle } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SerializableVideo } from '@/lib/types';
import { getVideos } from '@/lib/actions';
import { VideoFormDialog } from '@/components/admin/video-form-dialog';
import { VideoCard } from '@/components/admin/video-card';

export default async function VideosPage() {
  const videos: SerializableVideo[] = await getVideos();

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
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

    