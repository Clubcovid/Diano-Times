
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Bot, X } from 'lucide-react';
import { DianoChatInterface } from './diano-chat-interface';
import { isAiFeatureEnabled } from '@/lib/ai-flags';

export function DianoChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    async function checkFlag() {
      const enabled = await isAiFeatureEnabled('isAskDianoEnabled');
      setIsEnabled(enabled);
    }
    checkFlag();
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="rounded-full w-14 h-14"
            aria-label="Toggle Chat"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-[90vw] max-w-lg p-0 border-0"
          style={{ marginBottom: '1rem' }}
        >
          <DianoChatInterface containerClassName="h-[70vh] max-h-[500px]" />
        </PopoverContent>
      </Popover>
    </div>
  );
}
