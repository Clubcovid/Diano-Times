'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase';
import { generateUrlFriendlySlug as genSlugAI } from '@/ai/flows/generate-url-friendly-slug';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, where, query, getDocs } from 'firebase/firestore';
import { postSchema, type PostFormData } from './schemas';
import { z } from 'zod';

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
    return { success: false, message: 'Failed to create post.' };
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
    return { success: false, message: 'Failed to update post.' };
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
