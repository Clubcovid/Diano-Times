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
} from 'firebase/firestore';
import type { Post } from './types';

const postsCollection = collection(db, 'posts');

function toPost(doc: any): Post {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as Post;
}

export async function getPosts(options: { publishedOnly?: boolean, tag?: string } = {}): Promise<Post[]> {
  const constraints = [orderBy('createdAt', 'desc')];

  if (options.publishedOnly) {
    constraints.push(where('status', '==', 'published'));
  }

  if (options.tag) {
    constraints.push(where('tags', 'array-contains', options.tag));
  }
  
  const q = query(postsCollection, ...constraints);

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(toPost);
  } catch (error) {
    console.error("Error fetching posts: ", error);
    // In a real app, you might want to handle this more gracefully.
    // For now, we return an empty array on error.
    return [];
  }
}

export async function getTags(): Promise<string[]> {
  const q = query(postsCollection, where('status', '==', 'published'));
  
  try {
    const snapshot = await getDocs(q);
    const tags = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data() as Omit<Post, 'id'>;
      data.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  } catch (error) {
    console.error("Error fetching tags: ", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(postsCollection, where('slug', '==', slug));
  
  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    // Assuming slugs are unique, return the first match.
    return toPost(snapshot.docs[0]);
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  const postDocRef = doc(db, 'posts', id);
  try {
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
