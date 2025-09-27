
'use server';

import { revalidatePath } from 'next/cache';
import { db, auth } from '@/lib/firebase-admin';
import { generateUrlFriendlySlug as genSlugAI } from '@/ai/flows/generate-url-friendly-slug';
import { generatePost as generatePostAI } from '@/ai/flows/generate-post';
import { generateMagazine as generateMagazineAI } from '@/ai/flows/generate-magazine';
import { postSchema, adSchema, videoSchema, type PostFormData } from '@/lib/schemas';
import { z } from 'zod';
import type { UserRecord } from 'firebase-admin/auth';
import type { AdminUser, Ad, Video, Post, Magazine, SerializablePost, SerializableAd, SerializableVideo } from '@/lib/types';
import { headers } from 'next/headers';
import { mockPosts, mockAds, mockVideos } from '@/lib/mock-data';
import { FieldValue, Timestamp, Query } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import type { AiFeatureFlags } from '@/lib/ai-flags';
import { isAiFeatureEnabled } from '@/lib/ai-flags';
import { renderToBuffer } from '@react-pdf/renderer';
import MagazineLayout from '@/components/magazine/magazine-layout';
import type { GenerateMagazineOutput } from '@/ai/flows/generate-magazine';
import { getWeatherForecast, GetWeatherForecastInput, WeatherForecast } from '@/ai/flows/get-weather-forecast';
import { format } from 'date-fns';

type SerializablePostForMagazine = {
  id: string;
  title: string;
  createdAt: string;
};


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
  if (!(await isAiFeatureEnabled('isUrlSlugGenerationEnabled'))) {
    return { success: false, error: 'AI slug generation is currently disabled by the admin.' };
  }
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

type FormState<T> = {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
  data?: T;
};

export async function createPost(data: PostFormData): Promise<FormState<SerializablePost>> {
  if (!db) {
    return { success: false, message: 'Database not connected. Is the admin SDK configured correctly?' };
  }

  const validatedFields = postSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.issues,
    };
  }

  let validatedData = validatedFields.data;

  if (!(await isSlugUnique(validatedData.slug))) {
    return {
      success: false,
      message: 'This slug is already in use. Please choose a different one.',
    };
  }
  
  try {
    const postToSave = {
      ...validatedData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('posts').add(postToSave);
    const newPostDoc = await docRef.get();
    const newPost = toSerializablePost(newPostDoc);

    revalidatePath('/');
    revalidatePath('/admin/posts');

    return { success: true, message: 'Post created successfully.', data: newPost };
  } catch (error) {
    console.error('Error creating post:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to create post: ${message}` };
  }
}

export async function updatePost(postId: string, data: PostFormData): Promise<FormState<SerializablePost>> {
  if (!db) {
    return { success: false, message: 'Database not connected.' };
  }
  
  const validatedFields = postSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
    };
  }
  
  let validatedData = validatedFields.data;

  if (!(await isSlugUnique(validatedData.slug, postId))) {
    return {
      success: false,
      message: 'This slug is already in use. Please choose a different one.',
    };
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    await postRef.update({
      ...validatedData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedPostDoc = await postRef.get();
    const updatedPost = toSerializablePost(updatedPostDoc);

    revalidatePath('/');
    revalidatePath(`/posts/${validatedData.slug}`);
    revalidatePath('/admin/posts');

    return { success: true, message: 'Post updated successfully.', data: updatedPost };
  } catch (error) {
    console.error('Error updating post:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to update post: ${message}` };
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


export async function getAds(): Promise<SerializableAd[]> {
  if (!db) {
      console.error("Database not connected. Cannot fetch ads.");
      return mockAds.map(ad => ({...ad, createdAt: new Date().toISOString()}));
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
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });
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

export async function createOrUpdateAd(prevState: AdActionState | undefined, formData: FormData): Promise<AdActionState> {
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


export async function getVideos(): Promise<SerializableVideo[]> {
  if (!db) {
    console.error("Database not connected. Cannot fetch videos.");
    return mockVideos.map(v => ({...v, createdAt: new Date().toISOString()}));
  }
  try {
    const videosCollection = db.collection('videos');
    const snapshot = await videosCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => {
        const data = doc.data() as Video;
        return {
            id: doc.id,
            title: data.title,
            youtubeUrl: data.youtubeUrl,
            createdAt: data.createdAt.toDate().toISOString()
        }
    });
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

export async function createOrUpdateVideo(prevState: VideoActionState | undefined, formData: FormData): Promise<VideoActionState> {
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
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
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

export async function updateUserProfile(prevState: ProfileActionState | undefined, formData: FormData): Promise<ProfileActionState> {
    if (!auth) {
        return { success: false, message: "Authentication service is not available." };
    }
    const displayName = formData.get('displayName') as string;
    
    const uid = await getUserIdFromSession();

    if (!uid) {
        return { success: false, message: "User not authenticated." };
    }
    
    if (!displayName || displayName.length < 3) {
        return { success: false, message: "Display name must be at least 3 characters." };
    }

    try {
        await auth.updateUser(uid, { displayName });
        
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

    const postsCollection = db.collection('posts');
    mockPosts.forEach(post => {
      const docRef = postsCollection.doc(post.id);
      const { id, ...postData } = post;
      batch.set(docRef, { ...postData, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });

    const adsCollection = db.collection('advertisements');
    mockAds.forEach(ad => {
      const docRef = adsCollection.doc(ad.id);
      const { id, ...adData } = ad;
      batch.set(docRef, { ...adData, createdAt: FieldValue.serverTimestamp() });
    });

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

export async function generateAndSavePost(topic: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (!(await isAiFeatureEnabled('isPostGenerationEnabled'))) {
    return { success: false, message: 'AI Post Generation is currently disabled by the admin.' };
  }
  if (!db) {
    return { success: false, message: "Database not connected. Cannot save post." };
  }
  if (!topic) {
    return { success: false, message: "Topic is required." };
  }

  try {
    const postData = await generatePostAI({ topic });
    const { success, slug, error } = await generateSlug(postData.slug);

    if (!success || !slug) {
      return { success: false, message: error || 'Failed to generate a unique slug.' };
    }

    const result = await createPost({
      ...postData,
      slug,
      status: 'draft',
    });

    if (result.success) {
      revalidatePath('/admin/posts');
      return { success: true, message: `Successfully generated and saved a draft for: "${postData.title}"` };
    } else {
      return { success: false, message: result.message };
    }
  } catch (e: any) {
    const message = e.message || "An unknown error occurred.";
    console.error("Error generating and saving post:", e);
    return { success: false, message: `Failed to generate post: ${message}` };
  }
}


export async function generateDraftPost(topic: string): Promise<{success: boolean, message: string, postId?: string}> {
    if (!(await isAiFeatureEnabled('isPostGenerationEnabled'))) {
        return { success: false, message: 'AI-powered post generation is disabled by the administrator.' };
    }
    
    try {
        const postData = await generatePostAI({ topic });
        const { success: slugSuccess, slug, error: slugError } = await generateSlug(postData.slug);

        if (!slugSuccess || !slug) {
            return { success: false, message: slugError || 'Failed to generate a unique slug.' };
        }

        const result = await createPost({
            ...postData,
            slug,
            status: 'draft',
        });

        if (result.success && result.data) {
            revalidatePath('/admin/autopilot');
            return { success: true, message: 'Draft created', postId: result.data.id };
        } else {
            return { success: false, message: result.message };
        }

    } catch (e: any) {
        return { success: false, message: e.message || 'An unknown error occurred.' };
    }
}


export async function getMagazines(): Promise<Magazine[]> {
    if (!db) {
        console.error("Database not connected. Cannot fetch magazines.");
        return [];
    }
    try {
        const magazinesCollection = db.collection('magazines');
        const snapshot = await magazinesCollection.orderBy('createdAt', 'desc').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Magazine));
    } catch (error) {
        console.error('Error fetching magazines:', error);
        return [];
    }
}

export async function getMagazine(id: string): Promise<Magazine | null> {
    if (!db) {
        return null;
    }
    try {
        const doc = await db.collection('magazines').doc(id).get();
        if (!doc.exists) {
            return null;
        }
        const data = doc.data();
        if (!data) return null;
        
        const magazineData = data.magazineData ? JSON.parse(JSON.stringify(data.magazineData)) : null;

        return {
            id: doc.id,
            title: data.title,
            fileUrl: data.fileUrl,
            createdAt: data.createdAt,
            postIds: data.postIds,
            magazineData: magazineData,
        } as Magazine;
    } catch (error) {
        console.error("Error fetching magazine:", error);
        return null;
    }
}

export async function generateMagazinePdf(postIds: string[]): Promise<{ success: boolean; message: string; magazineId?: string; }> {
    if (!(await isAiFeatureEnabled('isMagazineGenerationEnabled'))) {
      return { success: false, message: 'AI Magazine Generation is currently disabled by the admin.' };
    }
    if (!db) {
        return { success: false, message: 'Database not connected.' };
    }

    if (postIds.length === 0) {
        return { success: false, message: 'No posts were selected to generate a magazine.' };
    }

    try {
        const magazineContent: GenerateMagazineOutput = await generateMagazineAI({ postIds });

        const buffer = await renderToBuffer(<MagazineLayout data={magazineContent} />);
        
        const bucket = getStorage().bucket();
        const fileName = `magazines/diano-weekly-${uuidv4()}.pdf`;
        const file = bucket.file(fileName);

        await file.save(buffer, {
            metadata: {
                contentType: 'application/pdf',
            },
        });

        const [fileUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
        });
        
        const magazineData = {
            title: magazineContent.title,
            fileUrl: fileUrl,
            createdAt: FieldValue.serverTimestamp(),
            postIds: postIds,
            magazineData: magazineContent,
        };
        const docRef = await db.collection('magazines').add(magazineData);

        revalidatePath('/diano-weekly');
        revalidatePath('/admin/magazine');

        return { success: true, message: 'Magazine generated successfully.', magazineId: docRef.id };

    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Error generating magazine PDF:", error);
        return { success: false, message: `Failed to generate magazine: ${message}` };
    }
}


export async function updateAiFeatureFlags(flags: AiFeatureFlags): Promise<{ success: boolean, message?: string }> {
    const docRef = db?.collection('ai_settings').doc('feature_flags');
    if (!docRef) {
        return { success: false, message: 'Database not available.' };
    }
    try {
        await docRef.set(flags, { merge: true });
        revalidatePath('/admin/settings/ai');
        return { success: true };
    } catch (error) {
        console.error('Error updating AI feature flags:', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message };
    }
}

export async function getWeatherForecastAction(input: GetWeatherForecastInput): Promise<WeatherForecast | null> {
    try {
        const forecast = await getWeatherForecast(input);
        return forecast;
    } catch (error) {
        console.error('Error in getWeatherForecastAction:', error);
        return null;
    }
}

export async function getPublishedPostsForMagazine(): Promise<SerializablePostForMagazine[]> {
  const posts = await getPosts({ publishedOnly: true });
  return posts.map(post => ({
    id: post.id,
    title: post.title,
    createdAt: format(new Date(post.createdAt), 'PPP'),
  }));
}

function toSerializablePost(doc: FirebaseFirestore.DocumentSnapshot): SerializablePost {
  const data = doc.data();
  if (!data) throw new Error('Document data is empty');
  
  const post = {
    id: doc.id,
    ...data
  } as Post;

  return {
    ...post,
    createdAt: post.createdAt.toDate().toISOString(),
    updatedAt: post.updatedAt.toDate().toISOString(),
  };
}

interface GetPostsOptions {
  limit?: number;
  publishedOnly?: boolean;
  tag?: string;
  fromDate?: Date;
  ids?: string[];
  searchQuery?: string;
}

export async function getPosts(options: GetPostsOptions = {}, context?: any): Promise<SerializablePost[]> {
  const { limit, publishedOnly, tag, fromDate, ids, searchQuery } = options;

  if (!db) {
    console.warn("Firebase Admin is not initialized. Cannot fetch posts. Returning mock data.");
    return [];
  }

  const postsCollection = db.collection('posts');
  let query: Query = postsCollection;
  
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
      return [];
    }
  }


  try {
    const snapshot = await query.orderBy('createdAt', 'desc').limit(limit || 100).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    let posts = snapshot.docs.map(toSerializablePost);

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
      let posts = allPostsSnapshot.docs.map(toSerializablePost);

      if (publishedOnly) {
        posts = posts.filter(post => post.status === 'published');
      }
      if (tag) {
        posts = posts.filter(post => post.tags.includes(tag));
      }
      if (fromDate) {
        posts = posts.filter(post => new Date(post.createdAt) >= fromDate);
      }
       if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        posts = posts.filter(post => 
            post.title.toLowerCase().includes(lowerCaseQuery) || 
            post.content.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
  if (!db) {
    console.warn("Firebase Admin not available. Using mock data for trending tags.");
    const tagCounts: Record<string, number> = {};
    mockPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([tag]) => tag);
  }

  try {
    const postsCollection = db.collection('posts');
    const snapshot = await postsCollection
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const tagCounts: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
      const post = toSerializablePost(doc);
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([tag]) => tag);

  } catch(error: any) {
    if (error.code === 9 && error.message.includes('requires an index')) {
        console.warn(`Firestore query failed for trending tags due to a missing index. Falling back to manual calculation.`);
        const allPosts = await getPosts({ publishedOnly: true, limit: 100 });
        const tagCounts: Record<string, number> = {};
        allPosts.forEach(post => {
            post.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, limit)
            .map(([tag]) => tag);
    }
     console.error("Error fetching trending tags from Firestore:", error);
    return [];
  }
}


export async function getPostBySlug(slug: string): Promise<SerializablePost | null> {
    if (!db) {
      console.error(`Firebase Admin is not initialized. Cannot fetch post by slug: ${slug}.`);
      return null;
    }
  try {
    const postsCollection = db.collection('posts');
    const snapshot = await postsCollection.where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return toSerializablePost(snapshot.docs[0]);
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error);
    return null;
  }
}

export async function getPostById(id: string): Promise<SerializablePost | null> {
  if (!db) {
      console.error(`Firebase Admin is not initialized. Cannot fetch post by id: ${id}.`);
      return null;
  }
  try {
    const postDocRef = db.collection('posts').doc(id);
    const postDoc = await postDocRef.get();
    if (!postDoc.exists) {
       return null;
    }
    return toSerializablePost(postDoc);
  } catch (error) {
    console.error(`Error fetching post by ID ${id}:`, error);
    return null;
  }
}
