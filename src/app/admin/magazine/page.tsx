
'use client';

import { useState, useTransition } from 'react';
import { generateMagazinePdf } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Loader2, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MagazineGeneratorPage() {
    const [isGenerating, startTransition] = useTransition();
    const { toast } = useToast();
    const [lastGeneratedId, setLastGeneratedId] = useState<string | null>(null);
    const router = useRouter();

    const handleGenerate = () => {
        startTransition(async () => {
            setLastGeneratedId(null);
            const result = await generateMagazinePdf();
            if (result.success && result.magazineId) {
                toast({
                    title: 'Magazine Generated!',
                    description: 'The weekly magazine PDF file has been created.',
                });
                setLastGeneratedId(result.magazineId);
                router.refresh();
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'An unknown error occurred during generation.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Weekly Magazine Generator</h1>
                <p className="text-muted-foreground">
                    Use AI to generate a downloadable PDF of the weekly magazine.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Generate New Issue</CardTitle>
                    <CardDescription>
                        Click the button below to start the AI generation process. The AI will collect the latest posts from the past 7 days, create a magazine layout, and save it as a PDF file.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        This process can take up to a minute to complete. Please do not navigate away from the page after starting.
                    </p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Newspaper className="mr-2 h-4 w-4" />
                                Generate Diano Weekly PDF
                            </>
                        )}
                    </Button>
                    {lastGeneratedId && (
                        <div className="p-4 bg-secondary rounded-lg w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="font-semibold">Generation Complete!</p>
                                <p className="text-sm text-muted-foreground">Your new issue is ready.</p>
                            </div>
                            <div className='flex gap-2'>
                                <Button asChild>
                                    <Link href={`/diano-weekly/${lastGeneratedId}`} target="_blank">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Issue
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
