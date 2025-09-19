
import 'server-only';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore';
import type { Post } from './types';
import { mockPosts } from './mock-data';

const postsCollection = collection(db, 'posts');

function toPost(doc: any): Post {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as Post;
}

export async function getPosts(options: { publishedOnly?: boolean, tag?: string } = {}): Promise<Post[]> {
  const constraints: QueryConstraint[] = [];
  
  // We'll fetch all posts and then filter in code to avoid complex index requirements.
  const q = query(postsCollection);

  try {
    const snapshot = await getDocs(q);
    let posts = snapshot.docs.map(toPost);

    if (posts.length === 0) {
      console.log("No posts found in Firestore, using mock data.");
      posts = mockPosts;
    }

    if (options.publishedOnly) {
      posts = posts.filter(post => post.status === 'published');
    }

    if (options.tag) {
      posts = posts.filter(post => post.tags.includes(options.tag!));
    }
    
    // Sort by creation date, descending
    posts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return posts;
  } catch (error) {
    console.error("Error fetching posts: ", error);
    // If Firestore fetch fails, fall back to mock data
    console.log("Firestore fetch failed, using mock data as fallback.");
    let posts = mockPosts;
    if (options.publishedOnly) {
      posts = posts.filter(post => post.status === 'published');
    }
    if (options.tag) {
      posts = posts.filter(post => post.tags.includes(options.tag!));
    }
    posts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    return posts;
  }
}

export async function getTags(): Promise<string[]> {
  try {
    const q = query(postsCollection, where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    
    let tagsSource = snapshot.docs;

    if (tagsSource.length === 0) {
        // Fallback to mock data if firestore is empty
        const tags = new Set<string>();
        mockPosts.forEach(post => {
            if (post.status === 'published') {
                post.tags?.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }

    const tags = new Set<string>();
    tagsSource.forEach(doc => {
      const data = doc.data() as Omit<Post, 'id'>;
      data.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  } catch (error) {
    console.error("Error fetching tags: ", error);
    const tags = new Set<string>();
    mockPosts.forEach(post => {
        if (post.status === 'published') {
            post.tags?.forEach(tag => tags.add(tag));
        }
    });
    return Array.from(tags).sort();
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = query(postsCollection, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      const mockPost = mockPosts.find(p => p.slug === slug);
      return mockPost || null;
    }
    // Assuming slugs are unique, return the first match.
    return toPost(snapshot.docs[0]);
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    const mockPost = mockPosts.find(p => p.slug === slug);
    return mockPost || null;
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    const postDocRef = doc(db, 'posts', id);
    const postDoc = await getDoc(postDocRef);
    if (!postDoc.exists()) {
       const mockPost = mockPosts.find(p => p.id === id);
       return mockPost || null;
    }
    return toPost(postDoc);
  } catch (error) {
    console.error(`Error fetching post by ID ${id}:`, error);
    const mockPost = mockPosts.find(p => p.id === id);
    return mockPost || null;
  }
}
