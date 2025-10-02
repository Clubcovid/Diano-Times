



import 'server-only';
import { db } from '@/lib/firebase-admin';
import type { Ad, Post, ContentBlock } from './types';
import { mockPosts, mockAds } from './mock-data';
import { Query, Timestamp } from 'firebase-admin/firestore';
import { htmlToText } from 'html-to-text';

function contentToText(content: ContentBlock[] | string): string {
    if (typeof content === 'string') {
        return htmlToText(content);
    }
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

  // Handle legacy string content and ensure content is always an array for new posts
  let content: ContentBlock[];
  if (typeof data.content === 'string') {
    // Convert legacy string content to the new block format
    content = data.content.split('\n\n').map(p => ({ type: 'paragraph', value: p }));
  } else if (Array.isArray(data.content)) {
    content = data.content;
  } else {
    content = [{ type: 'paragraph', value: '' }]; // Fallback for undefined content
  }

  return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    content: content,
    coverImage: data.coverImage,
    tags: data.tags || [],
    status: data.status,
    authorName: data.authorName || 'Talk of Nations Staff',
    authorImage: data.authorImage || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
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

  if (!db) {
    console.warn("Firebase Admin is not initialized. Cannot fetch posts. Returning mock data.");
    let filteredMockPosts = mockPosts.map(p => {
        if (typeof p.content === 'string') {
            return {
                ...p,
                content: [{ type: 'paragraph', value: p.content }] as ContentBlock[]
            };
        }
        return p as Post;
    });

    if (publishedOnly) {
      filteredMockPosts = filteredMockPosts.filter(p => p.status === 'published');
    }
    if (tag) {
      filteredMockPosts = filteredMockPosts.filter(p => p.tags.includes(tag));
    }
    if (fromDate) {
       filteredMockPosts = filteredMockPosts.filter(p => p.createdAt.toDate() >= fromDate);
    }
    if (ids) {
        filteredMockPosts = filteredMockPosts.filter(p => ids.includes(p.id));
    }
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filteredMockPosts = filteredMockPosts.filter(p => 
            p.title.toLowerCase().includes(lowerCaseQuery) ||
            contentToText(p.content).toLowerCase().includes(lowerCaseQuery)
        );
    }
    
    return filteredMockPosts.slice(0, limit);
  }

  try {
    let query: Query = db.collection('posts');
    
    // Fetch all posts and then filter in memory to avoid complex queries requiring indexes.
    const snapshot = await query.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return [];
    }
    
    let posts = snapshot.docs.map(toPost);

    // Apply filtering after fetching
    if (publishedOnly) {
      posts = posts.filter(post => post.status === 'published');
    }
    if (tag) {
      posts = posts.filter(post => post.tags.includes(tag));
    }
    if (fromDate) {
      posts = posts.filter(post => post.createdAt.toDate() >= fromDate);
    }
    if (ids && ids.length > 0) {
      posts = posts.filter(post => ids.includes(post.id));
    }
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(lowerCaseQuery) || 
        contentToText(post.content).toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    return limit ? posts.slice(0, limit) : posts;

  } catch (error: any) {
    console.error("Error fetching posts from Firestore:", error);
    return [];
  }
}

export async function getTags(): Promise<string[]> {
    if (!db) {
      console.error("Firebase Admin is not initialized. Cannot fetch tags.");
      const mockTags = new Set<string>();
      mockPosts.forEach(post => post.tags.forEach(tag => mockTags.add(tag)));
      return Array.from(mockTags).sort();
    }
    const postsCollection = db.collection('posts');
  try {
    const snapshot = await postsCollection.where('status', '==', 'published').get();
    
    if (snapshot.empty) {
        return [];
    }

    const tags = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data() as Omit<Post, 'id'>;
      data.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  } catch (error) {
    console.error("Error fetching tags from Firestore:", error);
    return [];
  }
}

export async function getTrendingTags(limit: number = 5): Promise<string[]> {
  const posts = await getPosts({ publishedOnly: true, limit: 50 }); // Fetch recent 50 posts
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
}


export async function getPostBySlug(slug: string): Promise<Post | null> {
    if (!db) {
      console.error(`Firebase Admin is not initialized. Cannot fetch post by slug: ${slug}.`);
      const post = mockPosts.find(p => p.slug === slug);
      if (!post) return null;
      if (typeof post.content === 'string') {
        return { ...post, content: [{ type: 'paragraph', value: post.content }] } as Post;
      }
      return post as Post;
    }
  try {
    const postsCollection = db.collection('posts');
    const snapshot = await postsCollection.where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return toPost(snapshot.docs[0]);
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  if (!db) {
      console.error(`Firebase Admin is not initialized. Cannot fetch post by id: ${id}.`);
      const post = mockPosts.find(p => p.id === id);
      if (!post) return null;
      if (typeof post.content === 'string') {
        return { ...post, content: [{ type: 'paragraph', value: post.content }] } as Post;
      }
      return post as Post;
  }
  try {
    const postDocRef = db.collection('posts').doc(id);
    const postDoc = await postDocRef.get();
    if (!postDoc.exists) {
       return null;
    }
    return toPost(postDoc);
  } catch (error) {
    console.error(`Error fetching post by ID ${id}:`, error);
    return null;
  }
}


export async function getAds(): Promise<Ad[]> {
  if (!db) {
      console.error("Database not connected. Cannot fetch ads.");
      return mockAds.map(ad => ({...ad, createdAt: Timestamp.now()}));
  }
  try {
    const adsCollection = db.collection('advertisements');
    const snapshot = await adsCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => {
      const data = doc.data() as Ad;
      return {
        ...data,
        id: doc.id,
      };
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}
