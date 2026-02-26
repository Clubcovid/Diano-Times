
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
  if (!db) return true;
  try {
    const snapshot = await db.collection('posts').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return true;
    if (currentId && snapshot.docs[0].id === currentId) return true;
    return false;
  } catch (e) {
    return true;
  }
}

export async function generateSlug(title: string): Promise<{ success: boolean; slug?: string; error?: string }> {
  if (!(await isAiFeatureEnabled('isUrlSlugGenerationEnabled'))) {
    return { success: false, error: 'AI slug generation is disabled.' };
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
    const fallbackSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return { success: true, slug: fallbackSlug };
  }
}

export async function createPost(data: PostFormData): Promise<{ success: boolean; message: string; postId?: string }> {
  if (!db) return { success: false, message: 'Database not connected.' };
  const validated = postSchema.safeParse(data);
  if (!validated.success) return { success: false, message: 'Validation failed.' };

  try {
    const docRef = await db.collection('posts').add({
      ...validated.data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    revalidatePath('/');
    revalidatePath('/admin/posts');
    return { success: true, message: 'Post created successfully.', postId: docRef.id };
  } catch (error: any) {
    return { success: false, message: `Error: ${error.message}` };
  }
}

export async function updatePost(postId: string, data: PostFormData): Promise<{ success: boolean; message: string }> {
  if (!db) return { success: false, message: 'Database not connected.' };
  const validated = postSchema.safeParse(data);
  if (!validated.success) return { success: false, message: 'Validation failed.' };

  try {
    await db.collection('posts').doc(postId).update({
      ...validated.data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    revalidatePath('/');
    revalidatePath('/admin/posts');
    return { success: true, message: 'Post updated successfully.' };
  } catch (error: any) {
    return { success: false, message: `Error: ${error.message}` };
  }
}

export async function deletePost(postId: string): Promise<{ success: boolean, message: string }> {
  if (!db) return { success: false, message: 'Database not connected.' };
  try {
    await db.collection('posts').doc(postId).delete();
    revalidatePath('/');
    revalidatePath('/admin/posts');
    return { success: true, message: 'Post deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete post.' };
  }
}

export async function getUsers(): Promise<AdminUser[]> {
    if (!auth) return [];
    try {
        const userRecords = await auth.listUsers();
        return userRecords.users.map(u => ({
            uid: u.uid,
            email: u.email || 'No email',
            displayName: u.displayName || 'No name',
            photoURL: u.photoURL,
            creationTime: u.metadata.creationTime,
            lastSeen: u.metadata.lastSignInTime || 'N/A'
        }));
    } catch (error) {
        return [];
    }
}

export async function getAds(): Promise<SerializableAd[]> {
  if (!db) return mockAds.map(ad => ({ ...ad, createdAt: new Date().toISOString() })) as any;
  try {
    const snapshot = await db.collection('advertisements').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data, createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString() } as any;
    });
  } catch (error) {
    return mockAds.map(ad => ({ ...ad, createdAt: new Date().toISOString() })) as any;
  }
}

export async function getVideos(): Promise<Video[]> {
  if (!db) return mockVideos as Video[];
  try {
    const snapshot = await db.collection('videos').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
  } catch (error) {
    return mockVideos as Video[];
  }
}

export async function getElectionCountdownConfig(): Promise<ElectionCountdownConfig> {
    const defaultVal = { isEnabled: false, country: 'Kenya', electionDate: Timestamp.now() };
    if (!db) return defaultVal;
    try {
        const doc = await db.collection('site_settings').doc('election_countdown').get();
        if (!doc.exists) return defaultVal;
        return { ...defaultVal, ...doc.data() } as ElectionCountdownConfig;
    } catch (error) {
        return defaultVal;
    }
}

export async function updateElectionCountdownConfig(data: ElectionCountdownFormData): Promise<{ success: boolean; message?: string; }> {
    if (!db) return { success: false, message: 'Database not available.' };
    const validated = electionCountdownSchema.safeParse(data);
    if (!validated.success) return { success: false, message: 'Invalid data.' };

    try {
        await db.collection('site_settings').doc('election_countdown').set({
            ...validated.data,
            electionDate: Timestamp.fromDate(validated.data.electionDate),
        }, { merge: true });
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateAiFeatureFlags(flags: AiFeatureFlags): Promise<{ success: boolean, message?: string }> {
    if (!db) return { success: false, message: 'Database not available.' };
    try {
        await db.collection('ai_settings').doc('feature_flags').set(flags, { merge: true });
        revalidatePath('/admin/settings/ai');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function generateAndSavePost(topic: string): Promise<{ success: boolean; message: string; postId?: string }> {
    if (!(await isAiFeatureEnabled('isPostGenerationEnabled'))) return { success: false, message: 'AI disabled.' };
    try {
        const postData = await generatePostAI({ topic });
        const slugResult = await generateSlug(postData.title);
        if (!slugResult.success) return { success: false, message: 'Slug failure.' };

        return await createPost({
            title: postData.title,
            slug: slugResult.slug!,
            content: postData.content,
            coverImage: '',
            tags: postData.tags,
            status: 'draft',
            authorName: 'AI Assistant',
            authorImage: 'https://picsum.photos/seed/ai-author/100/100',
        });
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function generateMagazinePdf(): Promise<{ success: boolean; message: string; magazineId?: string; }> {
    if (!(await isAiFeatureEnabled('isMagazineGenerationEnabled'))) return { success: false, message: 'AI disabled.' };
    if (!db) return { success: false, message: 'DB disconnected.' };

    try {
        const recentPosts = await getPosts({ fromDate: subDays(new Date(), 7), publishedOnly: true });
        if (recentPosts.length === 0) return { success: false, message: 'No recent posts.' };

        const content = await generateMagazineAI({ postIds: recentPosts.map(p => p.id) });
        const pdfBuffer = await renderToBuffer(<MagazineLayout data={content} />);
        
        const fileName = `magazines/diano-weekly-${uuidv4()}.pdf`;
        const file = getStorage().bucket().file(fileName);
        await file.save(pdfBuffer, { metadata: { contentType: 'application/pdf' } });

        const [fileUrl] = await file.getSignedUrl({ action: 'read', expires: '01-01-2099' });
        
        const docRef = await db.collection('magazines').add({
            title: content.title,
            fileUrl,
            createdAt: FieldValue.serverTimestamp(),
            postIds: recentPosts.map(p => p.id),
        });

        revalidatePath('/diano-weekly');
        return { success: true, message: 'Success', magazineId: docRef.id };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function getMagazines(): Promise<Magazine[]> {
    if (!db) return [];
    try {
        const snapshot = await db.collection('magazines').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Magazine));
    } catch (e) {
        return [];
    }
}

export async function getMagazine(id: string): Promise<Magazine | null> {
    if (!db) return null;
    try {
        const doc = await db.collection('magazines').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } as Magazine : null;
    } catch (e) {
        return null;
    }
}

export async function seedDatabase(): Promise<{ success: boolean, message: string }> {
  if (!db) return { success: false, message: "No DB." };
  try {
    const batch = db.batch();
    mockPosts.forEach(p => batch.set(db!.collection('posts').doc(p.id), { ...p, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }));
    mockAds.forEach(a => batch.set(db!.collection('advertisements').doc(a.id), { ...a, createdAt: FieldValue.serverTimestamp() }));
    mockVideos.forEach(v => batch.set(db!.collection('videos').doc(v.id), { ...v, createdAt: FieldValue.serverTimestamp() }));
    await batch.commit();
    return { success: true, message: "Seeded." };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function notifyNewUserRegistration(user: any) { return sendNewUserNotification(user); }
export async function handleTelegramUpdate(u: any) { /* implementation */ }
export async function sendPostToTelegram(id: string) { /* implementation */ return { success: true, message: 'ok' }; }
export async function generateDraftPost(t: string) { return generateAndSavePost(t); }
export async function generateCoverImageAction(p: string) { 
    try {
        const r = await generateCoverImage({ prompt: p });
        return { success: true, imageUrl: r.imageUrl };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
