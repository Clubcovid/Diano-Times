
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function SeedPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSeed = async () => {
        setIsLoading(true);
        const result = await seedDatabase();
        if (result.success) {
            toast({
                title: 'Success!',
                description: result.message,
            });
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">Seed Database</h1>
                <p className="text-muted-foreground">
                    Populate your database with mock data.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Database Seeding</CardTitle>
                    <CardDescription>
                        This action will populate your Firestore collections (posts, ads, videos) with a set of mock data. This is useful for testing and development. This will overwrite existing documents with the same ID.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive font-semibold">
                        Warning: This is a destructive action and cannot be undone easily.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSeed} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Seeding...
                            </>
                        ) : 'Seed Database Now'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
