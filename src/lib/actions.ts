
'use server';

import { revalidatePath } from 'next/cache';
import { db, getFirebaseAuth } from '@/lib/firebase-admin';
import { generateUrlFriendlySlug as genSlugAI } from '@/ai/flows/generate-url-friendly-slug';
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp, updateDoc, where, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { postSchema, adSchema, videoSchema, type AdFormData, type VideoFormData } from './schemas';
import { z } from 'zod';
import type { UserRecord } from 'firebase-admin/auth';
import type { AdminUser, Ad, Video, Post } from './types';


async function isSlugUnique(slug: string, currentId?: string): Promise<boolean> {
  const q = query(collection(db, 'posts'), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return true;
  }
  if (currentId && snapshot.docs[0].id === currentId) {
    return true;
  }
  return false;
}

export async function generateSlug(title: string): Promise<{ success: boolean; slug?: string; error?: string }> {
  if (!title) {
    return { success: false, error: 'Title is required.' };
  }
  try {
    const result = await genSlugAI({ title });
    let slug = result.slug;

    let count = 1;
    while (!(await isSlugUnique(slug))) {
      slug = `${result.slug}-${count}`;
      count++;
    }

    return { success: true, slug };
  } catch (error) {
    console.error('Error generating slug with AI:', error);
    const fallbackSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return { success: true, slug: fallbackSlug };
  }
}

type FormState = {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
  postId?: string;
};

export async function createPost(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = postSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.issues,
    };
  }

  const data = validatedFields.data;

  if (!(await isSlugUnique(data.slug))) {
    return {
      success: false,
      message: 'This slug is already in use. Please choose a different one.',
      errors: [{ path: ['slug'], message: 'This slug is already in use.', code: 'custom' }],
    };
  }

  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidatePath('/');
    revalidatePath('/admin/posts');

    return { success: true, message: 'Post created successfully.', postId: docRef.id };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, message: 'Failed to create post. Is the database connected?' };
  }
}

export async function updatePost(postId: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = postSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.issues,
    };
  }
  
  const data = validatedFields.data;

  if (!(await isSlugUnique(data.slug, postId))) {
    return {
      success: false,
      message: 'This slug is already in use. Please choose a different one.',
      errors: [{ path: ['slug'], message: 'This slug is already in use.', code: 'custom' }],
    };
  }

  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    revalidatePath('/');
    revalidatePath(`/posts/${data.slug}`);
    revalidatePath('/admin/posts');

    return { success: true, message: 'Post updated successfully.', postId };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, message: 'Failed to update post. Is the database connected?' };
  }
}

export async function deletePost(postId: string): Promise<{ success: boolean, message: string }> {
  try {
    await deleteDoc(doc(db, 'posts', postId));
    revalidatePath('/');
    revalidatePath('/admin/posts');
    return { success: true, message: 'Post deleted successfully.' };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, message: 'Failed to delete post.' };
  }
}

function mapUser(user: UserRecord): AdminUser {
    return {
        uid: user.uid,
        email: user.email || 'No email',
        displayName: user.displayName || 'No name',
        photoURL: user.photoURL,
        creationTime: user.metadata.creationTime,
        lastSeen: user.metadata.lastSignInTime || 'N/A'
    };
}


export async function getUsers(): Promise<AdminUser[]> {
    try {
        const auth = getFirebaseAuth();
        const userRecords = await auth.listUsers();
        return userRecords.users.map(mapUser);
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Generic to-plain-object converter
function docToPlainObject<T>(doc: admin.firestore.DocumentSnapshot): T {
    const data = doc.data() as any;
    const plainObject: { [key: string]: any } = { id: doc.id };

    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            plainObject[key] = data[key].toDate().toISOString();
        } else {
            plainObject[key] = data[key];
        }
    }
    return plainObject as T;
}


// Advertisements Actions
export async function getAds(): Promise<Ad[]> {
  try {
    const adsCollection = collection(db, 'advertisements');
    const q = query(adsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt,
    } as Ad));
  } catch (error) {
    console.error('Error fetching ads:', error);
    return [];
  }
}

type AdActionState = {
  success: boolean;
  message: string;
  ad: Ad | null;
}

export async function createOrUpdateAd(prevState: AdActionState, formData: FormData): Promise<AdActionState> {
  const id = formData.get('id') as string;
  const isEditing = !!id;

  const rawData = Object.fromEntries(formData);
  const validatedFields = adSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, message: 'Validation failed.', ad: null };
  }
  
  const data = validatedFields.data;

  try {
    if (isEditing) {
      const adRef = doc(db, 'advertisements', id);
      await updateDoc(adRef, data);
      const updatedDoc = await getDoc(adRef);
      const updatedAd = { id, ...updatedDoc.data() } as Ad;
      revalidatePath('/admin/advertisements');
      return { success: true, message: 'Ad updated.', ad: updatedAd };
    } else {
      const docRef = await addDoc(collection(db, 'advertisements'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      const newDoc = await getDoc(docRef);
      const newAd = { id: newDoc.id, ...newDoc.data() } as Ad;
      revalidatePath('/admin/advertisements');
      return { success: true, message: 'Ad created.', ad: newAd };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to ${isEditing ? 'update' : 'create'} ad. ${message}`, ad: null };
  }
}

export async function deleteAd(adId: string): Promise<{ success: boolean, message: string }> {
  try {
    await deleteDoc(doc(db, 'advertisements', adId));
    revalidatePath('/admin/advertisements');
    return { success: true, message: 'Ad deleted successfully.' };
  } catch (error) {
    console.error('Error deleting ad:', error);
    return { success: false, message: 'Failed to delete ad.' };
  }
}


// Videos Actions
export async function getVideos(): Promise<Video[]> {
  try {
    const videosCollection = collection(db, 'videos');
    const q = query(videosCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt
    } as Video));
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

type VideoActionState = {
  success: boolean;
  message: string;
  video: Video | null;
}

export async function createOrUpdateVideo(prevState: VideoActionState, formData: FormData): Promise<VideoActionState> {
  const id = formData.get('id') as string;
  const isEditing = !!id;

  const rawData = Object.fromEntries(formData);
  const validatedFields = videoSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, message: 'Validation failed.', video: null };
  }
  
  const data = validatedFields.data;

  try {
    if (isEditing) {
      const videoRef = doc(db, 'videos', id);
      await updateDoc(videoRef, data);
      const updatedDoc = await getDoc(videoRef);
      const updatedVideo = { id: updatedDoc.id, ...updatedDoc.data() } as Video;
      revalidatePath('/admin/videos');
      revalidatePath('/video');
      return { success: true, message: 'Video updated.', video: updatedVideo };
    } else {
      const docRef = await addDoc(collection(db, 'videos'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      const newDoc = await getDoc(docRef);
      const newVideo = { id: newDoc.id, ...newDoc.data() } as Video;
      revalidatePath('/admin/videos');
      revalidatePath('/video');
      return { success: true, message: 'Video created.', video: newVideo };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to ${isEditing ? 'update' : 'create'} video. ${message}`, video: null };
  }
}

export async function deleteVideo(videoId: string): Promise<{ success: boolean, message: string }> {
  try {
    await deleteDoc(doc(db, 'videos', videoId));
    revalidatePath('/admin/videos');
    revalidatePath('/video');
    return { success: true, message: 'Video deleted successfully.' };
  } catch (error) {
    console.error('Error deleting video:', error);
    return { success: false, message: 'Failed to delete video.' };
  }
}
