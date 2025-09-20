
'use server';

import { revalidatePath } from 'next/cache';
import { db, auth } from '@/lib/firebase-admin';
import { generateUrlFriendlySlug as genSlugAI } from '@/ai/flows/generate-url-friendly-slug';
import { postSchema, adSchema, videoSchema } from './schemas';
import { z } from 'zod';
import type { UserRecord } from 'firebase-admin/auth';
import type { AdminUser, Ad, Video, Post } from './types';
import { headers } from 'next/headers';
import { mockPosts, mockAds, mockVideos } from './mock-data';
import { FieldValue } from 'firebase-admin/firestore';


async function isSlugUnique(slug: string, currentId?: string): Promise<boolean> {
  if (!db) {
    console.error("DB not connected for slug check");
    return true; 
  }
  const postsRef = db.collection('posts');
  const snapshot = await postsRef.where('slug', '==', slug).get();
  
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
  if (!db) {
    return { success: false, message: 'Database not connected. Is the admin SDK configured correctly?' };
  }
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
    const docRef = await db.collection('posts').add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
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
  if (!db) {
    return { success: false, message: 'Database not connected.' };
  }
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
    const postRef = db.collection('posts').doc(postId);
    await postRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
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
  if (!db) {
    return { success: false, message: 'Database not connected.' };
  }
  try {
    await db.collection('posts').doc(postId).delete();
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
    if (!auth) {
        console.error("Firebase Auth (Admin) is not initialized. Check your Firebase Admin credentials.");
        return [];
    }
    try {
        const userRecords = await auth.listUsers();
        return userRecords.users.map(mapUser);
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}


export async function getAds(): Promise<Ad[]> {
  if (!db) {
      console.error("Database not connected. Cannot fetch ads.");
      return [];
  }
  try {
    const adsCollection = db.collection('advertisements');
    const snapshot = await adsCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
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
  if (!db) {
    return { success: false, message: 'Database not connected.', ad: null };
  }
  const id = formData.get('id') as string;
  const isEditing = !!id;

  const rawData = Object.fromEntries(formData);
  const validatedFields = adSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, message: 'Validation failed.', ad: null };
  }
  
  const data = validatedFields.data;

  try {
    let adToReturn: Ad;
    if (isEditing) {
      const adRef = db.collection('advertisements').doc(id);
      await adRef.update(data);
      const updatedDoc = await adRef.get();
      adToReturn = { id, ...updatedDoc.data() } as Ad;
    } else {
      const docRef = await db.collection('advertisements').add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
      });
      const newDoc = await docRef.get();
      adToReturn = { id: newDoc.id, ...newDoc.data() } as Ad;
    }
    revalidatePath('/admin/advertisements');
    return { 
        success: true, 
        message: `Ad ${isEditing ? 'updated' : 'created'}.`, 
        ad: adToReturn 
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to ${isEditing ? 'update' : 'create'} ad. ${message}`, ad: null };
  }
}

export async function deleteAd(adId: string): Promise<{ success: boolean, message: string }> {
  if (!db) {
    return { success: false, message: 'Database not connected.' };
  }
  try {
    await db.collection('advertisements').doc(adId).delete();
    revalidatePath('/admin/advertisements');
    return { success: true, message: 'Ad deleted successfully.' };
  } catch (error) {
    console.error('Error deleting ad:', error);
    return { success: false, message: 'Failed to delete ad.' };
  }
}


export async function getVideos(): Promise<Video[]> {
  if (!db) {
    console.error("Database not connected. Cannot fetch videos.");
    return [];
  }
  try {
    const videosCollection = db.collection('videos');
    const snapshot = await videosCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ 
      id: doc.id,
      ...doc.data(),
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
  if (!db) {
    return { success: false, message: 'Database not connected.', video: null };
  }
  const id = formData.get('id') as string;
  const isEditing = !!id;

  const rawData = Object.fromEntries(formData);
  const validatedFields = videoSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, message: 'Validation failed.', video: null };
  }
  
  const data = validatedFields.data;

  try {
     let videoToReturn: Video;
    if (isEditing) {
      const videoRef = db.collection('videos').doc(id);
      await videoRef.update(data);
      const updatedDoc = await videoRef.get();
      videoToReturn = { id: updatedDoc.id, ...updatedDoc.data() } as Video;
    } else {
      const docRef = await db.collection('videos').add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
      });
      const newDoc = await docRef.get();
      videoToReturn = { id: newDoc.id, ...newDoc.data() } as Video;
    }
    revalidatePath('/admin/videos');
    revalidatePath('/video');
    return { 
        success: true, 
        message: `Video ${isEditing ? 'updated' : 'created'}.`, 
        video: videoToReturn 
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to ${isEditing ? 'update' : 'create'} video. ${message}`, video: null };
  }
}

export async function deleteVideo(videoId: string): Promise<{ success: boolean, message: string }> {
  if (!db) {
    return { success: false, message: 'Database not connected.' };
  }
  try {
    await db.collection('videos').doc(videoId).delete();
    revalidatePath('/admin/videos');
    revalidatePath('/video');
    return { success: true, message: 'Video deleted successfully.' };
  } catch (error) {
    console.error('Error deleting video:', error);
    return { success: false, message: 'Failed to delete video.' };
  }
}

type ProfileActionState = {
    success: boolean;
    message: string;
}

async function getUserIdFromSession(): Promise<string | null> {
    const authHeader = headers().get('Authorization');
    if (!authHeader || !auth) return null;

    const token = authHeader.split('Bearer ')[1];
    if (!token) return null;

    try {
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}

export async function updateUserProfile(prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
    if (!auth) {
        return { success: false, message: "Authentication service is not available." };
    }
    const displayName = formData.get('displayName') as string;
    
    if (!displayName || displayName.length < 3) {
        return { success: false, message: "Display name must be at least 3 characters." };
    }

    try {
        const userId = await getUserIdFromSession();
        
        if (!userId) {
             return { success: false, message: "Could not authenticate user. Please log in again." };
        }
        
        await auth.updateUser(userId, { displayName });
        
        revalidatePath('/profile');
        return { success: true, message: "Profile updated successfully!" };

    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message: `Failed to update profile: ${message}` };
    }
}

export async function seedDatabase(): Promise<{ success: boolean, message: string }> {
  if (!db) {
    return { success: false, message: "Database not connected. Cannot seed data." };
  }

  try {
    const batch = db.batch();

    // Seed Posts
    const postsCollection = db.collection('posts');
    mockPosts.forEach(post => {
      const docRef = postsCollection.doc(post.id);
      const { id, ...postData } = post;
      batch.set(docRef, { ...postData, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });

    // Seed Ads
    const adsCollection = db.collection('advertisements');
    mockAds.forEach(ad => {
      const docRef = adsCollection.doc(ad.id);
      const { id, ...adData } = ad;
      batch.set(docRef, { ...adData, createdAt: FieldValue.serverTimestamp() });
    });

    // Seed Videos
    const videosCollection = db.collection('videos');
    mockVideos.forEach(video => {
      const docRef = videosCollection.doc(video.id);
      const { id, ...videoData } = video;
      batch.set(docRef, { ...videoData, createdAt: FieldValue.serverTimestamp() });
    });

    await batch.commit();
    
    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, message: "Database seeded successfully with mock data." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Error seeding database:", error);
    return { success: false, message: `Failed to seed database: ${message}` };
  }
}

    