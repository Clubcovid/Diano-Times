
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { getAds } from '@/lib/actions';
import type { Ad } from '@/lib/types';
import { Megaphone, X } from 'lucide-react';

const AD_POPUP_KEY = 'diano-times-ad-popup-dismissed';

type SerializableAd = Omit<Ad, 'createdAt'> & { createdAt: string };

export function AdPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [ad, setAd] = useState<SerializableAd | null>(null);

  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem(AD_POPUP_KEY);
    if (!hasBeenDismissed) {
      const fetchAndSetAd = async () => {
        try {
          const ads: Ad[] = await getAds();
          if (ads.length > 0) {
            const randomAd = ads[Math.floor(Math.random() * ads.length)];
            const serializableAd: SerializableAd = {
                ...randomAd,
                createdAt: randomAd.createdAt?.toDate ? randomAd.createdAt.toDate().toISOString() : new Date().toISOString(),
            };
            setAd(serializableAd);

            const timer = setTimeout(() => {
              setIsOpen(true);
            }, 5000); // 5 seconds
            
            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error("Failed to fetch ads for popup:", error);
        }
      };
      
      fetchAndSetAd();
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(AD_POPUP_KEY, 'true');
    setIsOpen(false);
  };
  
  if (!ad) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative">
            <button 
                onClick={handleClose}
                className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-1 hover:bg-black/75 transition-colors"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
            <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block group" onClick={handleClose}>
                <div className="aspect-square relative">
                    <Image 
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        className="object-cover"
                        data-ai-hint="promotional advertisement"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                 <div className="absolute bottom-0 left-0 p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <Megaphone className="h-4 w-4"/>
                        <p className="text-xs font-semibold uppercase tracking-wider">Advertisement</p>
                    </div>
                    <h3 className="font-headline text-2xl font-bold">{ad.title}</h3>
                    <p className="text-sm opacity-90">{ad.description}</p>
                </div>
            </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
