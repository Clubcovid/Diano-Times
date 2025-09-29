
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug, getPosts } from '@/lib/posts';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { BlogHeader } from '@/components/blog-header';
import { Metadata, ResolvingMetadata } from 'next';
import { htmlToText } from 'html-to-text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostCard } from '@/components/post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const description = htmlToText(post.content, {
    wordwrap: 155,
    selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' }
    ]
  }).substring(0, 155);

  const previousImages = (await parent).openGraph?.images || []
  const parentKeywords = (await parent).keywords || [];

  return {
    title: `${post.title} | Talk of Nations`,
    description: description,
    keywords: [...post.tags, ...parentKeywords],
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      url: `https://www.talkofnations.com/posts/${post.slug}`,
      images: post.coverImage ? [post.coverImage, ...previousImages] : [...previousImages],
      publishedTime: post.createdAt.toDate().toISOString(),
      modifiedTime: post.updatedAt.toDate().toISOString(),
      tags: post.tags,
      authors: [post.authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export async function generateStaticParams() {
  const posts = await getPosts({ publishedOnly: true });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const postDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
  const relatedPosts = await getPosts({ publishedOnly: true, tag: post.tags[0], limit: 3 });
  const filteredRelatedPosts = relatedPosts.filter(p => p.id !== post.id).slice(0, 2);

  return (
    <>
      <BlogHeader />
      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
            <article className="lg:col-span-2">
            <header className="mb-8">
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-primary">
                            <Link href={`/search?q=${tag}`}>{tag}</Link>
                        </Badge>
                        ))}
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight mb-4">
                {post.title}
                </h1>
                <div className="text-muted-foreground text-sm">
                <span>Published on {format(postDate, 'MMMM d, yyyy')}</span>
                </div>
            </header>
            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                src={post.coverImage || "https://picsum.photos/seed/diano-fallback/1200/800"}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 67vw"
                data-ai-hint="kenyan culture"
                />
            </div>
            <div
                className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-headline prose-headings:text-primary prose-a:text-accent-foreground prose-a:transition-colors hover:prose-a:text-primary prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
            </article>

            <aside className="lg:col-span-1 space-y-8 lg:sticky top-28 h-fit">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Article By</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={post.authorImage} alt={post.authorName} />
                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-lg">{post.authorName}</h3>
                                <p className="text-sm text-muted-foreground">Talk of Nations Contributor</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {filteredRelatedPosts.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Related Articles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {filteredRelatedPosts.map(relatedPost => (
                               <PostCard key={relatedPost.id} post={relatedPost} />
                           ))}
                        </CardContent>
                    </Card>
                )}
            </aside>
        </div>
      </main>
      <footer className="bg-muted text-muted-foreground py-12 mt-12">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Talk of Nations</h3>
            <p className="text-sm">Your source for Kenyan news, lifestyle, and technological trends.</p>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Categories</h3>
             <ul className="space-y-2 text-sm">
                <li><Link href="/fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
                <li><Link href="/gadgets" className="hover:text-primary transition-colors">Gadgets</Link></li>
                <li><Link href="/lifestyle" className="hover:text-primary transition-colors">Lifestyle</Link></li>
             </ul>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Follow Us</h3>
            {/* Add Social media icons here */}
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-8 text-center text-sm border-t border-border pt-6">
          &copy; {new Date().getFullYear()} Talk of Nations. All rights reserved.
        </div>
      </footer>
    </>
  );
}
