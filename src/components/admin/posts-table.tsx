
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2, Send } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  } from "@/components/ui/alert-dialog"
import type { Post } from '@/lib/types';
import { deletePost, sendPostToTelegram } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

type SerializablePost = Omit<Post, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
}

export function PostsTable({ posts }: { posts: SerializablePost[] }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSending, startSendingTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [currentPosts, setCurrentPosts] = useState(posts);

  const handleDelete = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  }

  const confirmDelete = () => {
    if (!postToDelete) return;
    
    startTransition(async () => {
      const result = await deletePost(postToDelete);
      if (result.success) {
        setCurrentPosts(currentPosts.filter(p => p.id !== postToDelete));
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
      setShowDeleteDialog(false);
      setPostToDelete(null);
    });
  }

  const handleSendToTelegram = (postId: string) => {
    startSendingTransition(async () => {
      const result = await sendPostToTelegram(postId);
      if (result.success) {
        toast({ title: 'Success', description: 'Post sent to Telegram channel.' });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  if (currentPosts.length === 0) {
    return (
        <div className="text-center py-16 border rounded-lg">
            <h2 className="text-2xl font-bold font-headline">No posts yet</h2>
            <p className="text-muted-foreground mt-2 mb-4">
                Create your first post to get started.
            </p>
            <Button asChild>
                <Link href="/admin/create">Create Post</Link>
            </Button>
        </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/edit/${post.id}`}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleSendToTelegram(post.id)} disabled={isSending}>
                          <Send className="mr-2 h-4 w-4" />
                          {isSending ? 'Sending...' : 'Send to Telegram'}
                        </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the post.
            </Description>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
