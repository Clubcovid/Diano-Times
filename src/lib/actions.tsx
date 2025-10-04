










'use server';

import { revalidatePath } from 'next/cache';
import { db, auth } from '@/lib/firebase-admin';
import { generateUrlFriendlySlug as genSlugAI } from '@/ai/flows/generate-url-friendly-slug';
import { generatePost as generatePostAI } from '@/ai/flows/generate-post';
import { generateMagazine as generateMagazineAI } from '@/ai/flows/generate-magazine';
import { generateCoverImage } from '@/ai/flows/generate-cover-image';
import { postSchema, adSchema, videoSchema, electionCountdownSchema, type PostFormData, type ElectionCountdownFormData } from './schemas';
import { z } from 'zod';
import type { UserRecord } from 'firebase-admin/auth';
import type { AdminUser, Ad, Video, Post, Magazine, ElectionCountdownConfig } from './types';
import { headers } from 'next/headers';
import { mockPosts, mockAds, mockVideos } from './mock-data';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import { getPosts, getPostById } from './posts';
import { subDays } from 'date-fns';
import type { AiFeatureFlags } from './ai-flags';
import { isAiFeatureEnabled } from './ai-flags';
import { renderToBuffer } from '@react-pdf/renderer';
import MagazineLayout from '@/components/magazine/magazine-layout';
import type { GenerateMagazineOutput } from '@/ai/flows/generate-magazine';
import { sendMessage, formatPostForTelegram, notifyNewUserRegistration as sendNewUserNotification } from './telegram';
import { telegramBotFlow } from '@/ai/flows/telegram-bot-flow';
import { htmlToText } from 'html-to-text';
import { tweetNewPost } from './twitter';

type SerializableAd = Omit<Ad, 'createdAt'> & {
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

type FormState = {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
  postId?: string;
};

export async function createPost(data: PostFormData): Promise<FormState> {
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
    
    let socialMessages: string[] = [];
    if (validatedData.status === 'published') {
        const newPost = await getPostById(docRef.id);
        if (newPost) {
            const siteUrl = headers().get('origin') || 'https://www.talkofnations.com';
            
            // Telegram
            if (process.env.TELEGRAM_NEWS_CHANNEL_ID) {
                const telegramMessage = formatPostForTelegram(newPost, siteUrl);
                const tgResult = await sendMessage({
                    chat_id: process.env.TELEGRAM_NEWS_CHANNEL_ID,
                    text: telegramMessage,
                    parse_mode: 'HTML',
                    disable_web_page_preview: false,
                });
                if (tgResult.success) {
                    socialMessages.push('sent to Telegram');
                } else {
                    socialMessages.push(`failed to send to Telegram: ${tgResult.message}`);
                }
            }

            // Twitter
            const twitterResult = await tweetNewPost(newPost, siteUrl);
            if (twitterResult.success) {
                socialMessages.push('sent to Twitter');
            } else {
                 socialMessages.push(`failed to send to Twitter: ${twitterResult.message}`);
            }
        }
    }
    
    const finalMessage = socialMessages.length > 0
        ? `Post created successfully; ${socialMessages.join(', ')}.`
        : 'Post created successfully.';


    revalidatePath('/');
    revalidatePath('/admin/posts');

    return { success: true, message: finalMessage, postId: docRef.id };
  } catch (error) {
    console.error('Error creating post:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to create post: ${message}` };
  }
}

export async function updatePost(postId: string, data: PostFormData): Promise<FormState> {
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
    const existingPostDoc = await postRef.get();
    const existingPostData = existingPostDoc.data();

    await postRef.update({
      ...validatedData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    let socialMessages: string[] = [];
    if (validatedData.status === 'published' && existingPostData?.status !== 'published') {
        const updatedPost = await getPostById(postId);
        if (updatedPost) {
            const siteUrl = headers().get('origin') || 'https://www.talkofnations.com';

            // Telegram
            if (process.env.TELEGRAM_NEWS_CHANNEL_ID) {
                const telegramMessage = formatPostForTelegram(updatedPost, siteUrl);
                const tgResult = await sendMessage({
                    chat_id: process.env.TELEGRAM_NEWS_CHANNEL_ID,
                    text: telegramMessage,
                    parse_mode: 'HTML',
                    disable_web_page_preview: false,
                });
                if (tgResult.success) {
                    socialMessages.push('sent to Telegram');
                } else {
                    socialMessages.push(`failed to send to Telegram: ${tgResult.message}`);
                }
            }

            // Twitter
            const twitterResult = await tweetNewPost(updatedPost, siteUrl);
            if (twitterResult.success) {
                socialMessages.push('sent to Twitter');
            } else {
                socialMessages.push(`failed to send to Twitter: ${twitterResult.message}`);
            }
        }
    }

    const finalMessage = socialMessages.length > 0
        ? `Post updated successfully; ${socialMessages.join(', ')}.`
        : 'Post updated successfully.';


    revalidatePath('/');
    revalidatePath(`/posts/${validatedData.slug}`);
    revalidatePath('/admin/posts');

    return { success: true, message: finalMessage, postId };
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


export async function getVideos(): Promise<Video[]> {
  if (!db) {
    console.error("Database not connected. Cannot fetch videos.");
    return mockVideos as Video[];
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
    // This function needs to be adapted if used client-side or without direct header access.
    // For server actions, this is fine.
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

export async function updateUserProfile(prevState: ProfileActionState | undefined, formData: FormData): Promise<ProfileActionState> {
    if (!auth) {
        return { success: false, message: "Authentication service is not available." };
    }
    const displayName = formData.get('displayName') as string;
    const uid = formData.get('uid') as string; // Assuming UID is passed in the form
    
    if (!displayName || displayName.length < 3) {
        return { success: false, message: "Display name must be at least 3 characters." };
    }
     if (!uid) {
        return { success: false, message: "User ID is missing." };
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

type GeneratePostResult = {
  success: boolean;
  message: string;
  postId?: string;
};

export async function generateAndSavePost(topic: string): Promise<GeneratePostResult> {
    if (!(await isAiFeatureEnabled('isPostGenerationEnabled'))) {
        return { success: false, message: 'AI Post Generation is currently disabled by the admin.' };
    }
    if (!db) {
        return { success: false, message: 'Database not connected. Cannot save post.' };
    }
    if (!topic) {
        return { success: false, message: 'Topic is required.' };
    }

    try {
        const postData = await generatePostAI({ topic });
        const { success: slugSuccess, slug, error: slugError } = await generateSlug(postData.title);

        if (!slugSuccess || !slug) {
            return { success: false, message: slugError || 'Failed to generate a unique slug.' };
        }

        const result = await createPost({
            title: postData.title,
            slug: slug,
            content: postData.content,
            coverImage: '', // Leave cover image blank for user to fill
            tags: postData.tags,
            status: 'draft',
            authorName: 'AI Assistant',
            authorImage: 'https://picsum.photos/seed/ai-author/100/100',
        });

        if (result.success) {
            return { success: true, message: `Draft for "${postData.title}" created.`, postId: result.postId };
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
        return { id: doc.id, ...doc.data() } as Magazine;
    } catch (error) {
        console.error("Error fetching magazine:", error);
        return null;
    }
}

export async function generateMagazinePdf(): Promise<{ success: boolean; message: string; magazineId?: string; }> {
    if (!(await isAiFeatureEnabled('isMagazineGenerationEnabled'))) {
      return { success: false, message: 'AI Magazine Generation is currently disabled by the admin.' };
    }
    if (!db) {
        return { success: false, message: 'Database not connected.' };
    }

    try {
        // 1. Fetch posts from the last 7 days
        const sevenDaysAgo = subDays(new Date(), 7);
        const recentPosts = await getPosts({ fromDate: sevenDaysAgo, publishedOnly: true });

        if (recentPosts.length === 0) {
            return { success: false, message: 'No new posts in the last 7 days to generate a magazine.' };
        }

        // 2. Generate magazine content with AI
        const magazineContent: GenerateMagazineOutput = await generateMagazineAI({ postIds: recentPosts.map(p => p.id) });

        // 3. Render PDF to a buffer on the server
        const pdfBuffer = await renderToBuffer(<MagazineLayout data={magazineContent} />);
        
        // 4. Upload PDF to Firebase Storage
        const bucket = getStorage().bucket();
        const fileName = `magazines/diano-weekly-${uuidv4()}.pdf`;
        const file = bucket.file(fileName);

        await file.save(pdfBuffer, {
            metadata: {
                contentType: 'application/pdf',
            },
        });

        const [fileUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // Far future expiration date
        });
        
        // 5. Save magazine metadata to Firestore
        const magazineData = {
            title: magazineContent.title,
            fileUrl: fileUrl,
            createdAt: FieldValue.serverTimestamp(),
            postIds: recentPosts.map(p => p.id),
        };
        const docRef = await db.collection('magazines').add(magazineData);

        // 6. Revalidate paths
        revalidatePath('/diano-weekly');
        revalidatePath('/admin/magazine');

        return { success: true, message: 'Magazine generated successfully.', magazineId: docRef.id };

    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Error generating magazine file:", error);
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

export async function notifyNewUserRegistration(user: { email?: string | null, displayName?: string | null }): Promise<{ success: boolean }> {
    return sendNewUserNotification(user);
}

export async function handleTelegramUpdate(update: any) {
    if (!update.message) {
        return { success: true };
    }
    const { message } = update;
    const { chat, text } = message;

    try {
        const botResponse = await telegramBotFlow({ chatId: chat.id, message: text });

        await sendMessage({
            chat_id: String(chat.id),
            text: botResponse.response,
        });

    } catch (error) {
        console.error("Error handling Telegram update:", error);
        await sendMessage({
            chat_id: String(chat.id),
            text: "Sorry, I encountered an error while processing your request.",
        });
    }

    return { success: true };
}

export async function sendPostToTelegram(postId: string): Promise<{ success: boolean, message: string }> {
  if (!process.env.TELEGRAM_NEWS_CHANNEL_ID) {
    return { success: false, message: 'Telegram News Channel ID is not configured.' };
  }

  const post = await getPostById(postId);
  if (!post) {
    return { success: false, message: 'Post not found.' };
  }

  try {
    const siteUrl = headers().get('origin') || 'https://www.talkofnations.com';
    const telegramMessage = formatPostForTelegram(post, siteUrl);

    await sendMessage({
      chat_id: process.env.TELEGRAM_NEWS_CHANNEL_ID,
      text: telegramMessage,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });

    return { success: true, message: 'Post sent to Telegram successfully.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message };
  }
}

export async function generateDraftPost(topic: string): Promise<GeneratePostResult> {
    try {
        if (!(await isAiFeatureEnabled('isPostGenerationEnabled'))) {
            return { success: false, message: 'AI-powered post generation is disabled by the administrator.' };
        }
        const postData = await generatePostAI({ topic });
        const { success: slugSuccess, slug, error: slugError } = await generateSlug(postData.title);

        if (!slugSuccess || !slug) {
            return { success: false, message: slugError || 'Failed to generate a unique slug.' };
        }

        const result = await createPost({
            title: postData.title,
            slug: slug,
            content: postData.content,
            coverImage: '',
            tags: postData.tags,
            status: 'draft',
            authorName: 'AI Assistant',
            authorImage: 'https://picsum.photos/seed/ai-author/100/100',
        });

        if (result.success) {
            return { success: true, message: 'Draft created', postId: result.postId };
        } else {
            return { success: false, message: result.message };
        }

    } catch (e: any) {
        return { success: false, message: e.message || 'An unknown error occurred.' };
    }
}

export async function generateCoverImageAction(prompt: string): Promise<{success: boolean; message?: string; imageUrl?: string;}> {
    try {
        if (!prompt) {
            return { success: false, message: 'A prompt (title) is required to generate an image.' };
        }
        const result = await generateCoverImage({ prompt });
        return { success: true, imageUrl: result.imageUrl };
    } catch(e: any) {
        return { success: false, message: e.message || 'An unknown error occurred while generating the image.' };
    }
}

const defaultCountdownConfig: Omit<ElectionCountdownConfig, 'electionDate'> & { electionDate: null } = {
    isEnabled: false,
    country: 'Kenya',
    electionDate: null,
};

export async function getElectionCountdownConfig(): Promise<ElectionCountdownConfig> {
    const docRef = db?.collection('site_settings').doc('election_countdown');
    if (!docRef) {
        return { ...defaultCountdownConfig, electionDate: Timestamp.now() };
    }
    try {
        const doc = await docRef.get();
        if (!doc.exists) {
            return { ...defaultCountdownConfig, electionDate: Timestamp.now() };
        }
        const data = doc.data() as ElectionCountdownConfig;
        return { ...defaultCountdownConfig, ...data };
    } catch (error) {
        console.error('Error fetching election countdown config:', error);
        return { ...defaultCountdownConfig, electionDate: Timestamp.now() };
    }
}

export async function updateElectionCountdownConfig(data: ElectionCountdownFormData): Promise<{ success: boolean; message?: string; }> {
    const docRef = db?.collection('site_settings').doc('election_countdown');
    if (!docRef) {
        return { success: false, message: 'Database not available.' };
    }

    const validatedFields = electionCountdownSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
          success: false,
          message: validatedFields.error.errors.map(e => e.message).join(', '),
        };
    }

    try {
        const configToSave = {
            ...validatedFields.data,
            electionDate: Timestamp.fromDate(validatedFields.data.electionDate),
        };
        await docRef.set(configToSave, { merge: true });
        revalidatePath('/');
        revalidatePath('/admin/countdown');
        return { success: true };
    } catch (error) {
        console.error('Error updating election countdown config:', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message };
    }
}
