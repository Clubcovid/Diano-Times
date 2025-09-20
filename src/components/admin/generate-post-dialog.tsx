
'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2 } from 'lucide-react';
import { generateAndSavePost } from '@/lib/actions';

export function GeneratePostDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, startGenerating] = useTransition();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: 'Topic is required',
        description: 'Please enter a topic to generate a post.',
        variant: 'destructive',
      });
      return;
    }

    startGenerating(async () => {
      const result = await generateAndSavePost(topic);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        setIsOpen(false);
        setTopic('');
      } else {
        toast({
          title: 'Error Generating Post',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Post with AI</DialogTitle>
          <DialogDescription>
            Enter a topic, and the AI will generate a full blog post draft for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">
              Topic
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 'The future of mobile payments in Kenya'"
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost" disabled={isGenerating}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : 'Generate'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
