
import 'server-only';
import { db } from '@/lib/firebase-admin';
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

function toPost(doc: any): Post {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as Post;
}

export async function getPosts(options: { publishedOnly?: boolean, tag?: string } = {}): Promise<Post[]> {
  if (!db) {
      console.error("Firestore (Admin) is not initialized. Check your Firebase Admin credentials. Cannot fetch posts.");
      return [];
  }
  const postsCollection = collection(db, 'posts');

  const constraints: QueryConstraint[] = [];
  
  if (options.publishedOnly) {
    constraints.push(where('status', '==', 'published'));
  }
  if (options.tag) {
    constraints.push(where('tags', 'array-contains', options.tag));
  }
  
  // Always sort by creation date
  constraints.push(orderBy('createdAt', 'desc'));

  const q = query(postsCollection, ...constraints);

  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(toPost);
  } catch (error) {
    console.error("Error fetching posts from Firestore. Is the Admin SDK configured correctly?", error);
    // Return empty array on error
    return [];
  }
}

export async function getTags(): Promise<string[]> {
    if (!db) {
        console.error("Firestore (Admin) is not initialized. Cannot fetch tags.");
        return [];
    }
    const postsCollection = collection(db, 'posts');
  try {
    const q = query(postsCollection, where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    
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
        console.error("Firestore (Admin) is not initialized. Cannot fetch post by slug.");
        return null;
    }
    const postsCollection = collection(db, 'posts');
  try {
    const q = query(postsCollection, where('slug', '==', slug));
    const snapshot = await getDocs(q);
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
        console.error("Firestore (Admin) is not initialized. Cannot fetch post by ID.");
        return null;
    }
  try {
    const postDocRef = doc(db, 'posts', id);
    const postDoc = await getDoc(postDocRef);
    if (!postDoc.exists()) {
       return null;
    }
    return toPost(postDoc);
  } catch (error) {
    console.error(`Error fetching post by ID ${id}:`, error);
    return null;
  }
}
