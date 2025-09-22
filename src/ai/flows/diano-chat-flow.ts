
'use server';

import { askDiano } from './ask-diano-flow';
import type { ChatSession, ChatMessage } from '@/lib/types';

// This file is now primarily for types and can be expanded for other non-database chat utilities.
// The core database logic has been moved to src/lib/actions.tsx to resolve build errors.
