
'use client';

import { Sparkles } from 'lucide-react';
import { BlogHeader } from '@/components/blog-header';
import { DianoChatInterface } from '@/components/diano-chat-interface';

export default function AskDianoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <BlogHeader />
      <main className="flex-1 p-4 md:p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
              Ask Diano
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your AI expert on all things Kenya. Ask me anything!
            </p>
          </div>
          <DianoChatInterface containerClassName="h-[60vh]" />
        </div>
      </main>
    </div>
  );
}
