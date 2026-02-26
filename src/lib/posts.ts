
import 'server-only';
import { db } from '@/lib/firebase-admin';
import type { Post, ContentBlock } from './types';
import { mockPosts } from './mock-data';
import { Timestamp } from 'firebase-admin/firestore';
import { htmlToText } from 'html-to-text';

function contentToText(content: ContentBlock[] | string): string {
    if (typeof content === 'string') return htmlToText(content);
    if (Array.isArray(content)) {
        return content
            .filter(block => block.type === 'paragraph')
            .map(block => block.value)
            .join(' ');
    }
    return '';
}

function toPost(doc: FirebaseFirestore.DocumentSnapshot): Post {
  const data = doc.data();
  if (!data) throw new Error('Document data is empty');

  let content: ContentBlock[];
  if (typeof data.content === 'string') {
    content = data.content.split('\n\n').filter(p => p.trim() !== '').map(p => ({ type: 'paragraph', value: p }));
  } else if (Array.isArray(data.content)) {
    content = data.content;
  } else {
    content = [{ type: 'paragraph', value: '' }];
  }

  return {
    id: doc.id,
    title: data.title || 'Untitled',
    slug: data.slug || doc.id,
    content: content,
    coverImage: data.coverImage || '',
    tags: data.tags || [],
    status: data.status || 'draft',
    authorName: data.authorName || 'Talk of Nations Staff',
    authorImage: data.authorImage || '',
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: data.updatedAt || Timestamp.now(),
  } as Post;
}

interface GetPostsOptions {
  limit?: number;
  publishedOnly?: boolean;
  tag?: string;
  fromDate?: Date;
  ids?: string[];
  searchQuery?: string;
}

export async function getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
  const { limit, publishedOnly, tag, fromDate, ids, searchQuery } = options;

  if (!db) return getMockPosts(options);

  try {
    const postsCollection = db.collection('posts');
    let query: FirebaseFirestore.Query = postsCollection;
    
    if (publishedOnly) query = query.where('status', '==', 'published');
    if (tag) query = query.where('tags', 'array-contains', tag);
    if (fromDate) query = query.where('createdAt', '>=', Timestamp.fromDate(fromDate));
    if (ids) {
      if (ids.length > 0) query = query.where('__name__', 'in', ids);
      else return [];
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(limit || 100).get();
    if (snapshot.empty) return [];
    
    let posts = snapshot.docs.map(toPost);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(p => p.title.toLowerCase().includes(q) || contentToText(p.content).toLowerCase().includes(q));
    }
    
    return posts;
  } catch (error: any) {
    // Quota exhausted (8) or missing index (9)
    return getMockPosts(options);
  }
}

function getMockPosts(options: GetPostsOptions): Post[] {
    const { limit, publishedOnly, tag, fromDate, ids, searchQuery } = options;
    let filtered = mockPosts.map(p => {
        const content = typeof p.content === 'string' ? [{ type: 'paragraph', value: p.content }] as ContentBlock[] : p.content as ContentBlock[];
        return { ...p, content } as Post;
    });

    if (publishedOnly) filtered = filtered.filter(p => p.status === 'published');
    if (tag) filtered = filtered.filter(p => p.tags.includes(tag));
    if (fromDate) filtered = filtered.filter(p => p.createdAt.toDate() >= fromDate);
    if (ids) filtered = filtered.filter(p => ids.includes(p.id));
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || contentToText(p.content).toLowerCase().includes(q));
    }
    return filtered.slice(0, limit || 100);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!db) return getMockPostBySlug(slug);
  try {
    const snapshot = await db.collection('posts').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return getMockPostBySlug(slug);
    return toPost(snapshot.docs[0]);
  } catch (e) {
    return getMockPostBySlug(slug);
  }
}

function getMockPostBySlug(slug: string): Post | null {
    const mock = mockPosts.find(p => p.slug === slug);
    if (!mock) return null;
    return { ...mock, content: typeof mock.content === 'string' ? [{ type: 'paragraph', value: mock.content }] : mock.content } as Post;
}

export async function getPostById(id: string): Promise<Post | null> {
  if (!db) return mockPosts.find(p => p.id === id) as Post || null;
  try {
    const doc = await db.collection('posts').doc(id).get();
    if (!doc.exists) return null;
    return toPost(doc);
  } catch (e) {
    return null;
  }
}

export async function getTags(): Promise<string[]> {
  if (!db) {
    const tags = new Set<string>();
    mockPosts.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }
  try {
    const snapshot = await db.collection('posts').where('status', '==', 'published').get();
    const tags = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      data.tags?.forEach((t: string) => tags.add(t));
    });
    return Array.from(tags).sort();
  } catch (e) {
    return [];
  }
}

export async function getTrendingTags(limit: number = 5): Promise<string[]> {
  try {
    const posts = await getPosts({ publishedOnly: true, limit: 50 });
    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([tag]) => tag);
  } catch (e) {
    return ['News', 'Politics', 'Lifestyle', 'Tech', 'Culture'].slice(0, limit);
  }
}
