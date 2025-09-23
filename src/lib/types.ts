
import type { Timestamp } from 'firebase/firestore';
import type { GenerateMagazineOutput } from '@/ai/flows/generate-magazine';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: 'draft' | 'published';
  authorName: string;
  authorImage: string;
  galleryImages?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type SerializablePost = Omit<Post, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export interface AdminUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    creationTime: string;
    lastSeen: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  createdAt: Timestamp;
}

export type SerializableAd = Omit<Ad, 'createdAt'> & { createdAt: string };


export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  createdAt: Timestamp;
}

export type SerializableVideo = Omit<Video, 'createdAt'> & { createdAt: string };

export interface Magazine {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: Timestamp;
  postIds: string[];
  magazineData: GenerateMagazineOutput;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: Array<{ slug: string; title: string; }>;
}

export interface ChatSession {
    id: string;
    userId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    messages: ChatMessage[];
}

    