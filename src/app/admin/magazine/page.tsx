
import { BlogHeader } from '@/components/blog-header';
import { getMagazines } from '@/lib/actions';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Newspaper, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

async function MagazineList() {
    const magazines = await getMagazines();

    if (magazines.length === 0) {
        return (
            <div className="text-center py-16">
                <Newspaper className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold font-headline">No Issues Yet</h2>
                <p className="mt-2 text-muted-foreground">Click the button above to create the first issue of Diano Weekly.</p>
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
                            Published on {format(new Date(magazine.createdAt as any), 'MMMM d, yyyy')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">View the issue online or download the PDF.</p>
                        <div className="flex gap-2">
                             <Button asChild variant="secondary">
                                <Link href={`/diano-weekly/${magazine.id}`} target="_blank">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Online
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={magazine.fileUrl} target="_blank" download={`diano-weekly-${magazine.id}.pdf`}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


export default function DianoWeeklyPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Diano Weekly</h1>
                    <p className="text-muted-foreground mt-2">
                        Your weekly digest of news, culture, and technology.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/admin/magazine/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Issue
                    </Link>
                </Button>
            </div>
            <MagazineList />
        </div>
    );
}

    