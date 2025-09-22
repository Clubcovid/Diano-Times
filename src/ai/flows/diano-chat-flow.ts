
'use server';

import { askDiano } from './ask-diano-flow';
import type { ChatSession, ChatMessage } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';


function createNewChatSession(userId: string): ChatSession {
    const now = Timestamp.now();
    return {
        id: '', // Will be set by the server action
        userId,
        createdAt: now,
        updatedAt: now,
        messages: [{
            role: 'model',
            content: 'Karibu to Diano Times! I am Diano, your AI assistant. Ask me anything about Kenyan news, politics, lifestyle... or what\'s on your mind. Let\'s talk, Omwami.'
        }]
    };
}
