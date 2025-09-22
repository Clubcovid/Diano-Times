'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateMagazinePdf, getPublishedPostsForMagazine } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Newspaper } from 'lucide-react';
import { format } from 'date-fns';

type SerializablePost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: 'draft' | 'published';
  authorName: string;
  authorImage: string;
  galleryImages?: string[] | undefined;
  createdAt: string;
  updatedAt: string;
};


export default function CreateMagazinePage() {
    const [posts, setPosts] = useState<SerializablePost[]>([]);
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, startGenerating] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            const fetchedPosts = await getPublishedPostsForMagazine();
            setPosts(fetchedPosts);
            setIsLoading(false);
        };
        fetchPosts();
    }, []);

    const handleSelectPost = (postId: string) => {
        setSelectedPosts(prev => 
            prev.includes(postId) 
            ? prev.filter(id => id !== postId) 
            : [...prev, postId]
        );
    };
    
    const handleGenerate = () => {
        if (selectedPosts.length === 0) {
            toast({
                title: 'No Posts Selected',
                description: 'Please select at least one post to include in the magazine.',
                variant: 'destructive',
            });
            return;
        }

        startGenerating(async () => {
            const result = await generateMagazinePdf(selectedPosts);
            if (result.success && result.magazineId) {
                toast({
                    title: 'Magazine Generated!',
                    description: 'Your new weekly issue has been created.',
                });
                router.push(`/diano-weekly/${result.magazineId}`);
            } else {
                 toast({
                    title: 'Error',
                    description: result.message || 'An unknown error occurred.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Create New Magazine Issue</h1>
                <p className="text-muted-foreground">Select the posts you want to include in this issue of Diano Weekly.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Articles</CardTitle>
                    <CardDescription>Choose from the list of published articles below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : posts.length === 0 ? (
                        <p className="text-center text-muted-foreground">No published posts found.</p>
                    ) : (
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-4">
                            {posts.map(post => (
                                <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20">
                                    <Checkbox 
                                        id={`post-${post.id}`}
                                        checked={selectedPosts.includes(post.id)}
                                        onCheckedChange={() => handleSelectPost(post.id)}
                                    />
                                    <Label htmlFor={`post-${post.id}`} className="flex-1 cursor-pointer">
                                        <p className="font-semibold">{post.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Published on {format(new Date(post.createdAt), 'PPP')}
                                        </p>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button onClick={handleGenerate} disabled={isGenerating || isLoading || selectedPosts.length === 0}>
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Issue...
                        </>
                    ) : (
                        <>
                            <Newspaper className="mr-2 h-4 w-4" />
                            Generate ({selectedPosts.length})
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
