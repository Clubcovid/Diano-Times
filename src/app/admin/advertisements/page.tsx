
'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdForm } from '@/components/admin/ad-form';
import type { Ad } from '@/lib/types';
import { getAds, deleteAd } from '@/lib/actions';
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

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAds() {
      setIsLoading(true);
      const fetchedAds = await getAds();
      const serializableAds = fetchedAds.map(ad => ({
        ...ad,
        createdAt: ad.createdAt?.toDate ? ad.createdAt.toDate().toISOString() : new Date().toISOString(),
      }));
      setAds(serializableAds);
      setIsLoading(false);
    }
    fetchAds();
  }, []);

  const handleFormSuccess = (updatedAd: Ad) => {
    const isNew = !ads.some(ad => ad.id === updatedAd.id);
    const serializableAd = {
        ...updatedAd,
        createdAt: updatedAd.createdAt?.toDate ? updatedAd.createdAt.toDate().toISOString() : new Date().toISOString(),
    };

    if (isNew) {
      setAds((prev) => [serializableAd, ...prev]);
    } else {
      setAds((prev) => prev.map((ad) => (ad.id === serializableAd.id ? serializableAd : ad)));
    }
    setIsFormOpen(false);
    setSelectedAd(null);
  };

  const handleEdit = (ad: Ad) => {
    setSelectedAd(ad);
    setIsFormOpen(true);
  };

  const handleDelete = (adId: string) => {
    setAdToDelete(adId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!adToDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteAd(adToDelete);
      if (result.success) {
        toast({ title: 'Success', description: 'Advertisement deleted.' });
        setAds((prev) => prev.filter((ad) => ad.id !== adToDelete));
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setShowDeleteDialog(false);
      setAdToDelete(null);
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Advertisements</h1>
            <p className="text-muted-foreground">Manage your site's advertisements.</p>
          </div>
          <Button
            onClick={() => {
              setSelectedAd(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Ad
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : ads.length === 0 ? (
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
            {ads.map((ad) => (
              <Card key={ad.id}>
                <CardHeader>
                  <div className="relative">
                     <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
                      <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(ad)}>
                                    <Pencil className="mr-2 h-4 w-4"/>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(ad.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg font-headline">{ad.title}</CardTitle>
                  <CardDescription className="mt-1 text-sm line-clamp-2">
                    {ad.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                        <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
                            Visit Link
                        </Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AdForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        ad={selectedAd}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this advertisement.
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

