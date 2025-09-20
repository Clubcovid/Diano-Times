
'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { Send, Sparkles, Loader2, Bot, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BlogHeader } from '@/components/blog-header';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import type { ChatMessage, ChatSession } from '@/lib/types';
import { getUserChatSession, saveAndContinueConversation } from '@/ai/flows/diano-chat-flow';
import { auth } from '@/lib/firebase';

export default function AskDianoPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isAsking, startAsking] = useTransition();
  const [question, setQuestion] = useState('');
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);

  const getAuthHeaders = useCallback(async () => {
    if (!auth.currentUser) return new Headers();
    const token = await auth.currentUser.getIdToken();
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
    return headers;
  }, []);

  useEffect(() => {
    if (user && !loading) {
      const fetchHistory = async () => {
        try {
          const headers = await getAuthHeaders();
          const session = await getUserChatSession({ headers });
          setChatSession(session);
        } catch(e: any) {
             toast({
              title: 'Could not load chat',
              description: e.message || 'Failed to fetch your conversation history.',
              variant: 'destructive',
            });
        }
      };
      fetchHistory();
    }
  }, [user, loading, getAuthHeaders, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking || !chatSession) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    
    // Optimistically update the UI
    setChatSession(prev => prev ? { ...prev, messages: [...prev.messages, userMessage] } : null);
    setQuestion('');

    startAsking(async () => {
      try {
        const headers = await getAuthHeaders();
        const updatedSession = await saveAndContinueConversation(chatSession.id, userMessage, { headers });
        setChatSession(updatedSession);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to get an answer.',
          variant: 'destructive',
        });
        // On error, revert the optimistic update
        setChatSession(prev => prev ? { ...prev, messages: prev.messages.slice(0, -1) } : null);
      }
    });
  };

  const renderContent = () => {
      if (loading) {
          return (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )
      }
      if (!user) {
          return (
               <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>Login to Chat</CardTitle>
                        <CardDescription>You must be logged in to chat with Diano and save your conversation history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/login?redirect=/ask-diano">Login Now</Link>
                        </Button>
                    </CardContent>
                </Card>
          )
      }

      return (
        <>
            <div className="space-y-6">
                {chatSession?.messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && (
                    <Avatar>
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    )}
                    <div className={`rounded-lg p-4 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Sources from Diano Times:
                            </h4>
                            <div className="space-y-2">
                            {msg.sources.map(source => (
                                <Button asChild variant="link" size="sm" key={source.slug} className="p-0 h-auto block w-full text-left">
                                    <Link href={`/posts/${source.slug}`} target="_blank">
                                        {source.title}
                                    </Link>
                                </Button>
                            ))}
                            </div>
                        </div>
                    )}
                    </div>
                    {msg.role === 'user' && (
                    <Avatar>
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    )}
                </div>
                ))}
                {isAsking && (
                    <div className="flex items-start gap-4">
                        <Avatar>
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-4 bg-background flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin"/>
                            <span>Diano is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="sticky bottom-6 mt-8">
                <div className="relative">
                <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What are the best places to visit in Mombasa?"
                    className="h-14 pr-16 text-base"
                    disabled={isAsking || !user}
                />
                <Button
                    type="submit"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    disabled={isAsking || !question.trim() || !user}
                >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </Button>
                </div>
            </form>
        </>
      )
  }

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
            {renderContent()}
        </div>
      </main>
    </div>
  );
}
