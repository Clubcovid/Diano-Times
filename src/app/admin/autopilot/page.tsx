
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Sparkles, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestTopics } from '@/ai/flows/suggest-topics';
import { generateDraftPost } from '@/ai/flows/generate-post';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

type TopicStatus = 'pending' | 'generating' | 'success' | 'error';
interface Topic {
  id: number;
  title: string;
  status: TopicStatus;
  postId?: string;
  error?: string;
}

export default function AutoPilotPage() {
  const { toast } = useToast();
  const [isSuggesting, startSuggesting] = useTransition();
  const [isGenerating, startGenerating] = useTransition();
  const [topics, setTopics] = useState<Topic[]>([]);

  const handleSuggestTopics = () => {
    startSuggesting(async () => {
      setTopics([]);
      try {
        const result = await suggestTopics();
        setTopics(result.topics.map((title, index) => ({ id: index, title, status: 'pending' })));
        toast({ title: 'Success', description: 'New topics have been suggested.' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to suggest topics.', variant: 'destructive' });
      }
    });
  };
  
  const handleGenerateDrafts = () => {
    if (topics.filter(t => t.status === 'pending').length === 0) {
        toast({ title: 'No Topics to Generate', description: 'Please suggest new topics first or wait for current generation to complete.', variant: 'destructive'});
        return;
    }

    startGenerating(async () => {
      const pendingTopics = topics.filter(t => t.status === 'pending');
      
      for (const topic of pendingTopics) {
        setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, status: 'generating' } : t));
        const result = await generateDraftPost(topic.title);

        if (result.success) {
            setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, status: 'success', postId: result.postId } : t));
        } else {
            setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, status: 'error', error: result.message } : t));
        }
      }
      toast({ title: 'Generation Complete', description: 'Finished generating all drafts.'});
    });
  };

  const getStatusIcon = (status: TopicStatus) => {
    switch (status) {
        case 'pending': return <FileText className="h-5 w-5 text-muted-foreground" />;
        case 'generating': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
        case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Content Auto-Pilot</h1>
        <p className="text-muted-foreground">Automate content creation with AI.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topic & Draft Generator</CardTitle>
          <CardDescription>
            Let the AI suggest new blog topics. Once you have a list, the AI can automatically write drafts for all of them, which you can then review and publish from the 'Posts' page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleSuggestTopics} disabled={isSuggesting || isGenerating} className="flex-1">
              {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Suggest New Topics
            </Button>
            <Button onClick={handleGenerateDrafts} disabled={isGenerating || topics.length === 0 || topics.every(t => t.status !== 'pending')} className="flex-1">
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate All Drafts
            </Button>
          </div>
          
          {topics.length > 0 && (
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold">Suggested Topics</h3>
                 <ul className="space-y-3">
                    <AnimatePresence>
                        {topics.map(topic => (
                             <motion.li 
                                key={topic.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                             >
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(topic.status)}
                                    <div>
                                        <p className="font-medium">{topic.title}</p>
                                        {topic.status === 'error' && <p className="text-xs text-destructive">{topic.error}</p>}
                                    </div>
                                </div>
                                {topic.status === 'success' && topic.postId && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/edit/${topic.postId}`}>Review Draft</Link>
                                    </Button>
                                )}
                             </motion.li>
                        ))}
                    </AnimatePresence>
                 </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
