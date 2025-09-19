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

  if (options.publishedOnly) {
    constraints.push(where('status', '==', 'published'));
  }

  if (options.tag) {
    constraints.push(where('tags', 'array-contains', options.tag));
  } else {
    // Only sort by createdAt on the main page fetch, not on tag-filtered pages
    // This avoids the need for a composite index for each tag.
    constraints.push(orderBy('createdAt', 'desc'));
  }
  
  const q = query(postsCollection, ...constraints);

  try {
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(toPost);
    // If we filtered by tag, we sort here in code instead of in the query.
    if (options.tag) {
        posts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    }
    return posts;
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
