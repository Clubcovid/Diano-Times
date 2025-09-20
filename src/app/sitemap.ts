import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';

const BASE_URL = 'https://dianotimes.com'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts({ publishedOnly: true });

  const postEntries: MetadataRoute.Sitemap = posts.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/posts/${slug}`,
    lastModified: updatedAt.toDate(),
  }));

  const staticRoutes = [
    '', 
    '/about', 
    '/contact', 
    '/video', 
    '/diano-weekly',
    '/fashion',
    '/gadgets',
    '/lifestyle',
    '/sports',
    '/global-affairs',
    '/privacy',
  ].map(route => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...postEntries];
}
