
import { htmlToText } from 'html-to-text';
import type { Post, ContentBlock } from './types';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface SendMessageOptions {
    chat_id: string;
    text: string;
    parse_mode?: 'HTML' | 'MarkdownV2';
    disable_web_page_preview?: boolean;
}

/**
 * Sends a message to a Telegram chat or channel.
 * @param options - The message options.
 * @returns An object indicating success or failure.
 */
export async function sendMessage(options: SendMessageOptions): Promise<{ success: boolean; message: string }> {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('Telegram Bot Token is not configured.');
        return { success: false, message: 'Telegram integration is not configured on the server.' };
    }

    try {
        const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        });

        const result = await response.json();

        if (!result.ok) {
            console.error('Telegram API Error:', result.description);
            return { success: false, message: `Telegram API Error: ${result.description}` };
        }

        return { success: true, message: 'Message sent successfully.' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('Failed to send Telegram message:', error);
        return { success: false, message };
    }
}


function contentToText(content: ContentBlock[] | string): string {
    if (typeof content === 'string') {
        // Handle legacy string content
        return htmlToText(content, { wordwrap: false });
    }
    if (Array.isArray(content)) {
        // Handle new block-based content
        return content
            .filter(block => block.type === 'paragraph')
            .map(block => block.value)
            .join(' ');
    }
    return '';
}

/**
 * Formats a post for a Telegram notification.
 * @param post - The post object.
 * @param siteUrl - The base URL of the site.
 * @returns A formatted HTML string for the Telegram message.
 */
export function formatPostForTelegram(post: Post, siteUrl: string): string {
    const postUrl = `${siteUrl}/posts/${post.slug}`;
    
    const contentText = contentToText(post.content);
    const snippet = contentText.substring(0, 200);
    const tags = post.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ');

    // Using HTML for better formatting options in Telegram
    return `
<b>🔥 New Post Published! 🔥</b>

<a href="${postUrl}"><b>${post.title}</b></a>

<i>${snippet}...</i>

<a href="${postUrl}">Read More</a>

${tags}
    `;
}
