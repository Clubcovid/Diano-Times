
import 'server-only';
import { db } from '@/lib/firebase-admin';
import type { Post } from './types';
import { mockPosts } from './mock-data';
import { Query, Timestamp } from 'firebase-admin/firestore';

function toPost(doc: FirebaseFirestore.DocumentSnapshot): Post {
  const data = doc.data();
  if (!data) throw new Error('Document data is empty');
  return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
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
    let filteredMockPosts = mockPosts;

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
            p.content.toLowerCase().includes(lowerCaseQuery)
        );
    }
    
    return filteredMockPosts.slice(0, limit);
  }

  const postsCollection = db.collection('posts');
  let query: Query = postsCollection;
  
  // Build the query
  if (publishedOnly) {
    query = query.where('status', '==', 'published');
  }
  if (tag) {
    query = query.where('tags', 'array-contains', tag);
  }
   if (fromDate) {
    query = query.where('createdAt', '>=', Timestamp.fromDate(fromDate));
  }
  if (ids) {
     if (ids.length > 0) {
      query = query.where('__name__', 'in', ids);
    } else {
      return []; // Return empty if no IDs are provided
    }
  }


  try {
    const snapshot = await query.orderBy('createdAt', 'desc').limit(limit || 100).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    let posts = snapshot.docs.map(toPost);

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(lowerCaseQuery) || 
        post.content.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    return posts;

  } catch (error: any) {
    if (error.code === 9 && error.message.includes('requires an index')) {
      console.warn(`Firestore query failed due to a missing index. Falling back to client-side filtering. Message: ${error.message}`);
      
      let fallbackQuery: Query = db.collection('posts');
      if (ids && ids.length > 0) {
         fallbackQuery = fallbackQuery.where('__name__', 'in', ids);
      }
      
      const allPostsSnapshot = await fallbackQuery.get();
      let posts = allPostsSnapshot.docs.map(toPost);

      // Manual filtering
      if (publishedOnly) {
        posts = posts.filter(post => post.status === 'published');
      }
      if (tag) {
        posts = posts.filter(post => post.tags.includes(tag));
      }
      if (fromDate) {
        posts = posts.filter(post => post.createdAt.toDate() >= fromDate);
      }
       if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        posts = posts.filter(post => 
            post.title.toLowerCase().includes(lowerCaseQuery) || 
            post.content.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      posts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      return posts.slice(0, limit || 100);
    }
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
      return mockPosts.find(p => p.slug === slug) || null;
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
      return mockPosts.find(p => p.id === id) || null;
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
