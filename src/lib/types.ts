
import type { Timestamp } from 'firebase/firestore';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: 'draft' | 'published';
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
  pdfUrl: string;
  createdAt: Timestamp;
  postIds: string[];
}
