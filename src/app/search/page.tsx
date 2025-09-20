
import { Suspense } from 'react';
import { getPosts } from '@/lib/posts';
import { PostCard } from '@/components/post-card';
import { BlogHeader } from '@/components/blog-header';
import { SearchForm } from '@/components/search-form';
import { Search } from 'lucide-react';

async function SearchResults({ query }: { query: string }) {
    const posts = await getPosts({ publishedOnly: true, searchQuery: query });

    if (posts.length === 0) {
        return (
            <div className="text-center py-16">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold font-headline">No results found</h2>
                <p className="mt-2 text-muted-foreground">
                    We couldn't find any posts matching "{query}". Try a different search.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}


export default function SearchPage({ searchParams }: { searchParams: { q: string }}) {
    const query = searchParams.q || '';
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <BlogHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 md:px-6 py-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Search Results</h1>
                            {query && <p className="text-lg text-muted-foreground mt-2">Showing results for: "{query}"</p>}
                            <div className="mt-6">
                                <SearchForm initialQuery={query} />
                            </div>
                        </div>

                        <Suspense fallback={<div>Loading...</div>}>
                            <SearchResults query={query} />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}

