
'use server';

import { db, auth } from '@/lib/firebase-admin';
import type { ChatSession, ChatMessage } from '@/lib/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { askDianoFlow } from './ask-diano-flow';

async function getUserIdFromSession(headers?: Headers): Promise<string | null> {
    const authHeader = headers?.get('Authorization');
    if (!authHeader || !auth) return null;

    const token = authHeader.split('Bearer ')[1];
    if (!token) return null;

    try {
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying token for chat:", error);
        return null;
    }
}

async function createNewChatSession(userId: string): Promise<ChatSession> {
    if (!db) throw new Error('Database not connected.');
    
    const newSession: Omit<ChatSession, 'id'> = {
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        messages: [{
            role: 'model',
            content: 'Karibu to Diano Times! I am Diano, your AI assistant. Ask me anything about Kenyan news, politics, lifestyle... or what\'s on your mind. Let\'s talk, Omwami.'
        }]
    };
    const docRef = await db.collection('diano_chats').add(newSession);
    
    return { id: docRef.id, ...newSession };
}


export async function getUserChatSession(options?: { headers?: Headers }): Promise<ChatSession> {
    if (!db) throw new Error('Database not connected.');
    
    const userId = await getUserIdFromSession(options?.headers);
    if (!userId) {
        throw new Error('User not authenticated.');
    }

    const chatCollection = db.collection('diano_chats');
    const snapshot = await chatCollection.where('userId', '==', userId).orderBy('createdAt', 'desc').limit(1).get();
    
    if (snapshot.empty) {
        return createNewChatSession(userId);
    } else {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ChatSession;
    }
}

export async function saveAndContinueConversation(sessionId: string, userMessage: ChatMessage, options?: { headers?: Headers }): Promise<ChatSession> {
    if (!db) throw new Error('Database not connected.');
    
    const userId = await getUserIdFromSession(options?.headers);
    if (!userId) {
        throw new Error('User not authenticated.');
    }

    const sessionRef = db.collection('diano_chats').doc(sessionId);

    // Save user message first
    await sessionRef.update({
        messages: FieldValue.arrayUnion(userMessage),
        updatedAt: FieldValue.serverTimestamp(),
    });

    const currentSession = await sessionRef.get();
    const currentData = currentSession.data() as Omit<ChatSession, 'id'>;

    // Get AI response, passing headers through
    const aiResponse = await askDianoFlow({
        question: userMessage.content,
        history: currentData.messages,
        headers: options?.headers,
    });

    const modelMessage: ChatMessage = {
        role: 'model',
        content: aiResponse.answer,
        sources: aiResponse.sources
    };

    // Save AI response
    await sessionRef.update({
        messages: FieldValue.arrayUnion(modelMessage),
        updatedAt: FieldValue.serverTimestamp(),
    });
    
    const updatedSessionDoc = await sessionRef.get();
    return { id: updatedSessionDoc.id, ...updatedSessionDoc.data() } as ChatSession;
}
