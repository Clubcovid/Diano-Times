'use client';

import { useState } from 'react';
import type { Ad } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AdForm } from './ad-form';

interface AdFormDialogProps {
  ad?: Ad | null;
  children: React.ReactNode;
}

export function AdFormDialog({ ad, children }: AdFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!ad;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Advertisement</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this ad.' : 'Fill out the form to add a new ad.'}
          </DialogDescription>
        </DialogHeader>
        <AdForm ad={ad} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
