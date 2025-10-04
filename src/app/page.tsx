

import { PostCard } from '@/components/post-card';
import { getPosts, getTrendingTags } from '@/lib/posts';
import type { Post } from '@/lib/types';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowUp, ArrowDown, Sun, Cloud, CloudRain, CloudLightning, Wind, Snowflake, type LucideIcon, Zap, Instagram, Twitter, Facebook } from 'lucide-react';
import { mockMarketData, mockWeatherData } from '@/lib/mock-data';
import { getWeatherForecast, type WeatherForecast } from '@/ai/flows/get-weather-forecast';
import { BlogHeader } from '@/components/blog-header';
import { BackToTop } from '@/components/back-to-top';
import { NewsletterPopup } from '@/components/newsletter-popup';
import { SearchForm } from '@/components/search-form';
import { AdPopup } from '@/components/ad-popup';
import { Logo } from '@/components/icons/logo';
import { getElectionCountdownConfig } from '@/lib/actions';
import { ElectionCountdown } from '@/components/election-countdown';

function PostsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
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

    const topics = [...trendingTopics, ...trendingTopics, ...trendingTopics, ...trendingTopics];

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
                            {topics.map((topic, index) => (
                              <Link key={index} href={`/search?q=${encodeURIComponent(topic)}`} className="font-medium text-muted-foreground hover:text-primary transition-colors px-4">
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
  const countdownConfig = await getElectionCountdownConfig();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
       <div className="lg:col-span-4">
        {featuredPost && (
          <section className="mb-12">
            <div className="relative aspect-video lg:aspect-[2.5/1] rounded-lg overflow-hidden group bg-muted">
                {featuredPost.coverImage ? (
                    <Image
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint="kenyan landscape"
                    />
                ) : (
                    <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                {countdownConfig && countdownConfig.isEnabled && countdownConfig.electionDate && (
                    <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-black/30 backdrop-blur-sm">
                         <ElectionCountdown
                            isHeroOverlay={true}
                            country={countdownConfig.country}
                            electionDate={typeof countdownConfig.electionDate === 'string' ? countdownConfig.electionDate : countdownConfig.electionDate.toDate().toISOString()}
                        />
                    </div>
                )}
                
                <div className="absolute inset-0 hidden flex-col items-center justify-center p-4 lg:flex">
                    <div className="w-full max-w-xl lg:max-w-2xl">
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

        <div className="lg:hidden -mt-6 mb-8 px-4">
             <SearchForm />
        </div>
        
        {otherPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
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
    </div>
  );
}

const MarketTicker = () => {
    const marketData = [...mockMarketData, ...mockMarketData, ...mockMarketData, ...mockMarketData];
    return (
        <div className="bg-secondary text-secondary-foreground py-2 border-b-2 border-primary">
            <div className="container mx-auto px-4 md:px-6">
                <div className="relative flex overflow-hidden group">
                    <div className="marquee">
                        <div className="marquee-content">
                            {marketData.map((stock, index) => (
                                <div key={index} className="flex items-center gap-4 text-sm font-medium">
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
  Cloudy: Cloud,
  CloudRain,
  CloudDrizzle: CloudRain,
  CloudLightning,
  Wind,
  Snowflake,
  CloudSnow: Snowflake,
};

const WeatherTicker = async () => {
  const cities = ['Nairobi, Kenya', 'Mombasa, Kenya', 'Kisumu, Kenya', 'Eldoret, Kenya', 'Nakuru, Kenya', 'Nyeri, Kenya', 'Malindi, Kenya'];
  let weatherData: (WeatherForecast | null)[] = [];

  try {
    weatherData = await Promise.all(
        cities.map(location => getWeatherForecast({ location }))
    );
  } catch (error) {
    console.error("Failed to fetch live weather data, using mock data as fallback:", error);
  }
  
  // Filter out any null results from failed API calls
  let validWeatherData = weatherData.filter((f): f is WeatherForecast => f !== null);

  // If all API calls failed or returned null, fall back to mock data
  if (validWeatherData.length === 0) {
    console.warn("All weather API calls failed. Using mock data as a fallback.");
    validWeatherData = mockWeatherData;
  }

  const duplicatedWeatherData = [...validWeatherData, ...validWeatherData, ...validWeatherData, ...validWeatherData];

  return (
    <div className="bg-background text-foreground py-2 border-b">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative flex overflow-hidden group">
          <div className="marquee">
            <div className="marquee-content">
              {duplicatedWeatherData.map((weather, index) => {
                const Icon = iconMap[weather.icon] || Cloud;
                return (
                  <div key={index} className="flex items-center gap-4 text-sm font-medium">
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

      <footer className="bg-muted text-muted-foreground py-8">
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
      <BackToTop />
      <NewsletterPopup />
      <AdPopup />
    </div>
  );
}
