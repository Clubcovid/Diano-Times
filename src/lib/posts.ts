
import 'server-only';
import { db } from '@/lib/firebase-admin';
import type { Post } from './types';
import { mockPosts } from './mock-data';
import type { Query, QuerySnapshot } from 'firebase-admin/firestore';

function toPost(doc: FirebaseFirestore.DocumentSnapshot): Post {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as Post;
}

export async function getPosts(options: { publishedOnly?: boolean, tag?: string } = {}): Promise<Post[]> {
  if (!db) {
    console.error("Firebase Admin is not initialized. Cannot fetch posts. Returning mock data.");
    return mockPosts.filter(p => {
        if (options.publishedOnly && p.status !== 'published') return false;
        if (options.tag && !p.tags.includes(options.tag)) return false;
        return true;
    });
  }

  const postsCollection = db.collection('posts');
  let query: Query = postsCollection;
  
  if (options.tag) {
    query = query.where('tags', 'array-contains', options.tag);
  } else if (options.publishedOnly) {
    query = query.where('status', '==', 'published');
  }

  try {
    const snapshot = await query.get();
    if (snapshot.empty) {
        return [];
    }
    
    let posts = snapshot.docs.map(toPost);

    // Manually sort by date since we removed it from the query to avoid index issues
    posts.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
    });

    if (options.tag && options.publishedOnly) {
      posts = posts.filter(post => post.status === 'published');
    }

    return posts;
  } catch (error) {
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

export async function getPostBySlug(slug: string): Promise<Post | null> {
    if (!db) {
      console.error(`Firebase Admin is not initialized. Cannot fetch post by slug: ${slug}.`);
      return mockPosts.find(p => p.slug === slug) || null;
    }
  try {
    const postsCollection = db.collection('posts');
    const snapshot = await postsCollection.where('slug', '==', slug).get();
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
