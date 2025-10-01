
'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter } from 'lucide-react';
import { Button } from './ui/button';
import { WhatsappIcon } from './icons/whatsapp';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Ensure this only runs on the client side
    setUrl(window.location.origin + `/posts/${slug}`);
  }, [slug]);

  if (!url) {
    return null; // Don't render on the server or before URL is available
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  return (
    <div className="flex gap-2">
      <Button
        asChild
        variant="outline"
        size="icon"
        className="border-gray-300 hover:bg-[#1DA1F2] hover:text-white"
      >
        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
          <Twitter className="h-5 w-5" />
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        size="icon"
        className="border-gray-300 hover:bg-[#1877F2] hover:text-white"
      >
        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
          <Facebook className="h-5 w-5" />
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        size="icon"
        className="border-gray-300 hover:bg-[#25D366] hover:text-white"
      >
        <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
          <WhatsappIcon className="h-5 w-5" />
        </a>
      </Button>
    </div>
  );
}
