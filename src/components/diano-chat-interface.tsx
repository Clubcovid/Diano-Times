
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import type { ChatMessage, ChatSession } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getUserChatSession, saveAndContinueConversation } from '@/lib/actions';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Bot, User, BookOpen, Send, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DianoChatInterfaceProps {
    containerClassName?: string;
}

export function DianoChatInterface({ containerClassName }: DianoChatInterfaceProps) {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isAsking, setIsAsking] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatSession?.messages, scrollToBottom]);

  useEffect(() => {
    if (user && !loading && !chatSession) {
      const fetchHistory = async () => {
        try {
          const session = await getUserChatSession();
          setChatSession(session);
        } catch (e: any) {
          toast({
            title: 'Could not load chat',
            description: e.message || 'Failed to fetch your conversation history.',
            variant: 'destructive',
          });
        }
      };
      fetchHistory();
    }
  }, [user, loading, toast, chatSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking || !chatSession) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const currentMessages = [...(chatSession.messages || []), userMessage];
    
    setChatSession(prev => prev ? { ...prev, messages: currentMessages } : null);
    setQuestion('');
    setIsAsking(true);

    try {
      const stream = await saveAndContinueConversation(chatSession.id, userMessage);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      let streamedResponse = { role: 'model' as const, content: '', sources: [] };
      setChatSession(prev => prev ? { ...prev, messages: [...currentMessages, streamedResponse] } : null);
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        if (chunk) {
          setChatSession(prev => {
            if (!prev) return null;
            const newMessages = [...prev.messages];
            const lastMessage = newMessages[newMessages.length - 1];

            if (chunk.includes('__SOURCES_JSON__:')) {
              const parts = chunk.split('__SOURCES_JSON__:');
              lastMessage.content += parts[0];
              try {
                const sourceData = JSON.parse(parts[1]);
                lastMessage.sources = sourceData.sources;
              } catch (e) { /* ignore parsing errors */ }
            } else {
              lastMessage.content += chunk;
            }
            return { ...prev, messages: newMessages };
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get an answer.',
        variant: 'destructive',
      });
      setChatSession(prev => prev ? { ...prev, messages: prev.messages.slice(0, -1)} : null);
    } finally {
      setIsAsking(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex justify-center items-center rounded-lg bg-muted/20", containerClassName || 'h-full')}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="text-center w-full my-auto">
        <CardHeader>
          <CardTitle>Login to Chat</CardTitle>
          <CardDescription>You must be logged in to chat with Diano.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/login?redirect=/ask-diano">Login Now</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col bg-muted/20 rounded-lg", containerClassName)}>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {chatSession?.messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'model' && (
                <Avatar><AvatarFallback><Bot /></AvatarFallback></Avatar>
              )}
              <div className={`rounded-lg p-4 max-w-[80%] shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                <p className="whitespace-pre-wrap">{msg.content}{msg.role === 'model' && isAsking && index === chatSession.messages.length - 1 ? '...' : ''}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className={`mt-4 border-t pt-3 ${msg.role === 'user' ? 'border-primary-foreground/20' : 'border-border'}`}>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4" />Sources:</h4>
                    <div className="space-y-2">
                      {msg.sources.map(source => (
                        <Button asChild variant="link" size="sm" key={source.slug} className={`p-0 h-auto block w-full text-left ${msg.role === 'user' ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-primary hover:underline'}`}>
                          <Link href={`/posts/${source.slug}`} target="_blank">{source.title}</Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <Avatar><AvatarFallback><User /></AvatarFallback></Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isAsking && chatSession?.messages[chatSession.messages.length - 1]?.role !== 'model' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
            <Avatar><AvatarFallback><Bot /></AvatarFallback></Avatar>
            <div className="rounded-lg p-4 bg-background flex items-center gap-2 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Diano is thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={chatContainerRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-background rounded-b-lg">
        <div className="relative">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask Diano anything..."
            className="h-12 pr-14 text-base"
            disabled={isAsking || !user}
          />
          <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-10" disabled={isAsking || !question.trim() || !user}>
            {isAsking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
