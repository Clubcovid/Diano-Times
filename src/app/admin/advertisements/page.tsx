
import { PlusCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdFormDialog } from '@/components/admin/ad-form-dialog';
import { AdCard } from '@/components/admin/ad-card';
import type { Ad } from '@/lib/types';
import { getAds } from '@/lib/actions';

// Helper function to serialize Firestore Timestamps
const serializeAds = (ads: Ad[]): any[] => {
    return ads.map(ad => ({
        ...ad,
        createdAt: ad.createdAt?.toDate ? ad.createdAt.toDate().toISOString() : new Date().toISOString(),
    }));
};

export default async function AdvertisementsPage() {
  const ads = await getAds();
  const serializableAds = serializeAds(ads);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Advertisements</h1>
            <p className="text-muted-foreground">Manage your site's advertisements.</p>
          </div>
          <AdFormDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Ad
            </Button>
          </AdFormDialog>
        </div>

        {ads.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold">No advertisements found.</h3>
              <p className="text-muted-foreground mt-2">
                Click "Add New Ad" to create your first one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serializableAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
