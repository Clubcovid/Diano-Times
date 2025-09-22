

import { PostCard } from '@/components/post-card';
import { getPosts, getTrendingTags } from '@/lib/posts';
import type { Post } from '@/lib/types';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowUp, ArrowDown, Sun, Cloud, CloudRain, CloudLightning, Wind, Snowflake, type LucideIcon, LogIn, UserPlus, LayoutDashboard, Zap } from 'lucide-react';
import { mockMarketData, mockWeatherData } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWeatherForecast, type WeatherForecast } from '@/ai/flows/get-weather-forecast';
import { BlogHeader } from '@/components/blog-header';
import { BackToTop } from '@/components/back-to-top';
import { getAds } from '@/lib/actions';
import type { Ad } from '@/lib/types';
import { NewsletterPopup } from '@/components/newsletter-popup';
import { SearchForm } from '@/components/search-form';

function PostsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function TrendingTicker() {
    const trendingTopics = await getTrendingTags(5);

    if (trendingTopics.length === 0) {
        return null;
    }

    return (
        <div className="bg-background border-b">
            <div className="container mx-auto px-4 md:px-6 py-2 flex items-center gap-4">
                <div className="flex-shrink-0 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Trending</h3>
                </div>
                 <div className="flex-1 relative flex overflow-hidden">
                    <div className="marquee">
                        <div className="marquee-content text-sm">
                            {trendingTopics.map((topic, index) => (
                              <Link key={index} href={`/search?q=${encodeURIComponent(topic)}`} className="font-medium text-muted-foreground hover:text-primary transition-colors px-4">
                                {topic}
                              </Link>
                            ))}
                             {trendingTopics.map((topic, index) => (
                              <Link key={`${index}-clone`} href={`/search?q=${encodeURIComponent(topic)}`} className="font-medium text-muted-foreground hover:text-primary transition-colors px-4">
                                {topic}
                              </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

async function Advertisement() {
  const ads: Ad[] = await getAds();

  if (ads.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advertisement</CardTitle>
      </CardHeader>
      <CardContent>
        {ads.slice(0, 1).map(ad => (
          <Link href={ad.linkUrl} key={ad.id} target="_blank" rel="noopener noreferrer" className="block group">
             <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={ad.imageUrl}
                alt={ad.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="advertisement marketing"
              />
              <div className="absolute inset-0 bg-black/40" />
               <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold font-headline">{ad.title}</h3>
                  <p className="text-xs">{ad.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

async function PostsSection() {
  let allPosts = await getPosts({ publishedOnly: true });

  if (allPosts.length === 0) {
     return (
       <div className="text-center py-16 col-span-full">
          <h2 className="text-2xl font-bold font-headline">No posts found</h2>
          <p className="text-muted-foreground mt-2">
            It looks like there are no published posts yet.
          </p>
        </div>
    );
  }

  const [featuredPost, ...otherPosts] = allPosts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
       <div className="lg:col-span-3">
        {featuredPost && (
          <section className="mb-12">
            <div className="relative aspect-video lg:aspect-[2/1] rounded-lg overflow-hidden group">
                <Image
                src={featuredPost.coverImage || 'https://picsum.photos/seed/diano-featured/1200/600'}
                alt={featuredPost.title}
                fill
                className="object-cover"
                priority
                data-ai-hint="kenyan landscape"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                
                <div className="absolute inset-0 hidden flex-col items-center justify-center p-4 md:flex">
                    <div className="w-full max-w-2xl">
                       <SearchForm />
                    </div>
                </div>

                <Link href={`/posts/${featuredPost.slug}`} className="absolute bottom-0 left-0 p-6 md:p-8 text-white group-hover:bg-gradient-to-t from-black/20 w-full md:absolute">
                 <div className='group-hover:translate-y-[-10px] transition-transform duration-300'>
                    {featuredPost.tags?.[0] && (
                        <Badge variant="secondary" className="mb-2">{featuredPost.tags[0]}</Badge>
                    )}
                    <h2 className="text-2xl md:text-4xl font-headline font-bold leading-tight max-w-3xl">
                        {featuredPost.title}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Continue Reading</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                 </div>
                </Link>
            </div>
          </section>
        )}

        <div className="md:hidden -mt-6 mb-8 px-4">
             <SearchForm />
        </div>
        
        {otherPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {otherPosts.slice(0, 4).map((post) => (
              <PostCard key={post.id} post={post as Post} />
            ))}
          </div>
        ) : (
           <div className="text-center py-16 col-span-full">
              <h2 className="text-2xl font-bold font-headline">No more posts found</h2>
              <p className="text-muted-foreground mt-2">
                It looks like there are no other published posts yet.
              </p>
            </div>
        )}
      </div>
      <aside className="hidden lg:block lg:col-span-1 space-y-8">
          <Suspense>
            <Advertisement />
          </Suspense>
      </aside>
    </div>
  );
}

const MarketTicker = () => {
    return (
        <div className="bg-secondary text-secondary-foreground py-2 border-b-2 border-primary">
            <div className="container mx-auto px-4 md:px-6">
                <div className="relative flex overflow-hidden group">
                    <div className="marquee">
                        <div className="marquee-content">
                            {mockMarketData.map(stock => (
                                <div key={stock.ticker} className="flex items-center gap-4 text-sm font-medium">
                                    <span className="font-bold">{stock.ticker}</span>
                                    <span>${stock.price.toFixed(2)}</span>
                                    <span className={`flex items-center ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {stock.change.startsWith('+') ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                        {stock.change}
                                    </span>
                                </div>
                            ))}
                             {mockMarketData.map(stock => (
                                <div key={stock.ticker +'-clone'} className="flex items-center gap-4 text-sm font-medium">
                                    <span className="font-bold">{stock.ticker}</span>
                                    <span>${stock.price.toFixed(2)}</span>
                                    <span className={`flex items-center ${stock.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {stock.change.startsWith('+') ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                        {stock.change}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const iconMap: { [key: string]: LucideIcon } = {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Snowflake,
};

const WeatherTicker = async () => {
  // AI-based weather fetching disabled to avoid rate-limiting issues.
  // const cities = ['Nairobi, Kenya', 'Mombasa, Kenya', 'Kisumu, Kenya', 'Eldoret, Kenya'];
  // const weatherData: WeatherForecast[] = [];
  // try {
  //   for (const location of cities) {
  //     const forecast = await getWeatherForecast({ location });
  //     if (forecast) {
  //       weatherData.push(forecast);
  //     }
  //   }
  // } catch (error) {
  //   console.error("Failed to fetch weather data:", error);
  //   // You could return a fallback or empty component here
  //   return null;
  // }
  const weatherData = mockWeatherData;

  if (weatherData.length === 0) {
    return null;
  }

  return (
    <div className="bg-background text-foreground py-2 border-b">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative flex overflow-hidden group">
          <div className="marquee">
            <div className="marquee-content">
              {weatherData.map(weather => {
                const Icon = iconMap[weather.icon] || Cloud;
                return (
                  <div key={weather.location} className="flex items-center gap-4 text-sm font-medium">
                    <span className="font-bold">{weather.location}</span>
                    <Icon className="h-5 w-5 text-primary" />
                    <span>{weather.temperature}</span>
                    <span className="text-muted-foreground">{weather.condition}</span>
                  </div>
                );
              })}
              {weatherData.map(weather => {
                const Icon = iconMap[weather.icon] || Cloud;
                return (
                  <div key={`${weather.location}-clone`} className="flex items-center gap-4 text-sm font-medium">
                    <span className="font-bold">{weather.location}</span>
                    <Icon className="h-5 w-5 text-primary" />
                    <span>{weather.temperature}</span>
                    <span className="text-muted-foreground">{weather.condition}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <Suspense>
          <WeatherTicker />
      </Suspense>
      <MarketTicker />
      <Suspense>
        <TrendingTicker />
      </Suspense>

      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Suspense fallback={<PostsSkeleton />}>
            <PostsSection />
          </Suspense>
        </div>
      </main>

      <footer className="bg-muted text-muted-foreground py-12">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Diano Times</h3>
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
          &copy; {new Date().getFullYear()} Diano Times. All rights reserved.
        </div>
      </footer>
      <BackToTop />
      <NewsletterPopup />
    </div>
  );
}

    
