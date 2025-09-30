
'use client';

import { useEffect, useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { getMagazine } from '@/lib/actions';
import type { Magazine } from '@/lib/types';
import MagazineLayout from '@/components/magazine/magazine-layout';
import { BlogHeader } from '@/components/blog-header';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileWarning } from 'lucide-react';
import { generateMagazine } from '@/ai/flows/generate-magazine';
import type { GenerateMagazineOutput } from '@/ai/flows/generate-magazine';
import { isClient } from '@/lib/utils';

// Mock data for initial render to avoid error with react-pdf
const mockSudoku = {
    puzzle: Array(9).fill(Array(9).fill(0)),
    solution: Array(9).fill(Array(9).fill(0)),
};
const mockMagazineData: GenerateMagazineOutput = {
    title: 'Loading Magazine...',
    introduction: 'Please wait while we prepare your issue.',
    sections: [],
    highlights: [],
    sudoku: mockSudoku,
};


export default function MagazineViewerPage({ params }: { params: { id: string } }) {
    const [magazine, setMagazine] = useState<Magazine | null>(null);
    const [magazineData, setMagazineData] = useState<GenerateMagazineOutput>(mockMagazineData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false)
 
    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient) return;

        const fetchMagazine = async () => {
            try {
                setIsLoading(true);
                const mag = await getMagazine(params.id);
                if (!mag) {
                    setError('Magazine not found.');
                    return;
                }
                setMagazine(mag);
                const data = await generateMagazine({ postIds: mag.postIds });
                setMagazineData(data);
            } catch (e: any) {
                setError(e.message || 'Failed to load magazine content.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMagazine();
    }, [params.id, isClient]);

    if (error) {
        return (
            <div className="flex flex-col min-h-screen">
                <BlogHeader />
                <main className="flex-1 flex items-center justify-center text-center">
                     <div className="p-8 border rounded-lg shadow-lg bg-card text-card-foreground">
                        <FileWarning className="mx-auto h-12 w-12 text-destructive mb-4" />
                        <h1 className="text-2xl font-bold font-headline text-destructive">Error Loading Magazine</h1>
                        <p className="text-muted-foreground mt-2">{error}</p>
                    </div>
                </main>
            </div>
        );
    }
    
    if (!isClient) {
        return (
             <div className="flex flex-col min-h-screen bg-muted/40">
                <div className="bg-background">
                    <BlogHeader />
                </div>
                 <main className="flex-1 flex items-center justify-center p-4">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading viewer...</p>
                    </div>
                 </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <div className="bg-background">
                <BlogHeader />
            </div>
            
            <header className="bg-background border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold font-headline text-primary truncate">
                        {isLoading ? 'Loading...' : magazineData.title}
                    </h1>
                     {isLoading ? (
                        <Button disabled>
                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </Button>
                    ) : (
                         <PDFDownloadLink
                            document={<MagazineLayout data={magazineData} />}
                            fileName={`diano-weekly-${params.id}.pdf`}
                        >
                            {({ loading }) => (
                                <Button disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="mr-2 h-4 w-4" />
                                    )}
                                    Download PDF
                                </Button>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>
            </header>
            
            <main className="flex-1 flex items-center justify-center p-4">
                 {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <p className="text-muted-foreground">Preparing your magazine...</p>
                    </div>
                ) : (
                    <PDFViewer width="100%" height="100%" className="w-full h-[calc(100vh-145px)] border rounded-lg shadow-lg">
                        <MagazineLayout data={magazineData} />
                    </PDFViewer>
                )}
            </main>
        </div>
    );
}
