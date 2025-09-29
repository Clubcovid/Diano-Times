
import type { Timestamp } from 'firebase/firestore';

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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

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

export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  createdAt: Timestamp;
}

export interface Magazine {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: Timestamp;
  postIds: string[];
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
