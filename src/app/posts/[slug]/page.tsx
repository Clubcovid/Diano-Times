
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug, getPosts, getAds } from '@/lib/posts';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { BlogHeader } from '@/components/blog-header';
import { Metadata, ResolvingMetadata } from 'next';
import { htmlToText } from 'html-to-text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostCard } from '@/components/post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import type { Ad, Post } from '@/lib/types';

type Props = {
  params: { slug: string }
}

async function Advertisement() {
    const ads = await getAds();
    if (ads.length === 0) {
        return null;
    }
    const ad: Ad = ads[Math.floor(Math.random() * ads.length)];
    return (
        <Card className="my-8">
            <CardContent className="p-4">
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-1/3 aspect-video rounded-md overflow-hidden">
                        <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-semibold uppercase">Advertisement</p>
                        <h4 className="font-bold font-headline">{ad.title}</h4>
                        <p className="text-sm text-muted-foreground">{ad.description}</p>
                    </div>
                </a>
            </CardContent>
        </Card>
    );
}

const renderContentWithAd = (content: string, adComponent: React.ReactNode) => {
    const paragraphs = content.split('</p>').filter(p => p.trim() !== '');
    if (paragraphs.length <= 2) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    
    const contentWithAd = [];
    for (let i = 0; i < paragraphs.length; i++) {
        contentWithAd.push(<div key={`p-${i}`} dangerouslySetInnerHTML={{ __html: paragraphs[i] + '</p>' }} />);
        if (i === 1) { // Insert ad after the second paragraph
            contentWithAd.push(<div key="ad">{adComponent}</div>);
        }
    }
    return <>{contentWithAd}</>;
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
                src={post.coverImage || "https://picsum.photos/seed/talkofnations-fallback/1200/800"}
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
            >
              {renderContentWithAd(post.content, <Advertisement />)}
            </div>
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
      <footer className="bg-muted text-muted-foreground py-8 mt-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">Talk of Nations</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/fashion" className="hover:text-primary transition-colors">Fashion</Link>
                <Link href="/gadgets" className="hover:text-primary transition-colors">Gadgets</Link>
                <Link href="/lifestyle" className="hover:text-primary transition-colors">Lifestyle</Link>
            </nav>
             <div className="flex gap-4">
                <a href="#" className="hover:text-primary" aria-label="Instagram"><Instagram /></a>
                <a href="https://x.com/TalkofNations?t=Z7MSDp3fplIqkuqYzTrxJw&s=09" target="_blank" rel="noopener noreferrer" className="hover:text-primary" aria-label="Twitter"><Twitter /></a>
                <a href="#" className="hover:text-primary" aria-label="Facebook"><Facebook /></a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm border-t border-border pt-6">
            &copy; {new Date().getFullYear()} Talk of Nations. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
