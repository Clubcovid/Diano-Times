import { BlogHeader } from '@/components/blog-header';
import { getMagazines } from '@/lib/actions';
import type { Magazine } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Newspaper } from 'lucide-react';
import { format } from 'date-fns';

async function MagazineList() {
    const magazines = await getMagazines();

    if (magazines.length === 0) {
        return (
            <div className="text-center py-16">
                <Newspaper className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold font-headline">No Issues Yet</h2>
                <p className="mt-2 text-muted-foreground">The first issue of Diano Weekly is being crafted. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {magazines.map((magazine) => (
                <Card key={magazine.id}>
                    <CardHeader>
                        <CardTitle>{magazine.title}</CardTitle>
                        <CardDescription>
                            Published on {format(magazine.createdAt.toDate(), 'MMMM d, yyyy')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Download the issue in PDF format.</p>
                        <Button asChild>
                            <Link href={magazine.pdfUrl} target="_blank" download={`diano-weekly-${magazine.id}.pdf`}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export default function DianoWeeklyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <BlogHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 md:px-6 py-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Diano Weekly</h1>
                            <p className="text-lg text-muted-foreground mt-2">
                                Your weekly digest of news, culture, and technology.
                            </p>
                        </div>
                        <MagazineList />
                    </div>
                </div>
            </main>
        </div>
    );
}
