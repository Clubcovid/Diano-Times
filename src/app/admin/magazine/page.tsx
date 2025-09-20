'use client';

import { useState, useTransition } from 'react';
import { generateMagazineText } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Loader2, Download } from 'lucide-react';
import Link from 'next/link';

export default function MagazineGeneratorPage() {
    const [isGenerating, startTransition] = useTransition();
    const { toast } = useToast();
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleGenerate = () => {
        startTransition(async () => {
            setFileUrl(null);
            const result = await generateMagazineText();
            if (result.success) {
                toast({
                    title: 'Magazine Generated!',
                    description: 'The weekly magazine text file has been created.',
                });
                setFileUrl(result.fileUrl || null);
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
                    Use AI to generate a downloadable text file of the weekly magazine.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Generate New Issue</CardTitle>
                    <CardDescription>
                        Click the button below to start the AI generation process. The AI will collect the latest posts from the past 7 days, create a magazine layout, and save it as a text file.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        This process can take a moment to complete. Please do not navigate away from the page after starting.
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
                                Generate Diano Weekly
                            </>
                        )}
                    </Button>
                    {fileUrl && (
                        <div className="p-4 bg-secondary rounded-lg w-full flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Generation Complete!</p>
                                <p className="text-sm text-muted-foreground">Your file is ready for download.</p>
                            </div>
                            <Button asChild>
                                <Link href={fileUrl} target="_blank" download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download .txt
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
