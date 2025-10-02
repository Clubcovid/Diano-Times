
'use server';

import { TwitterApi } from 'twitter-api-v2';
import type { Post } from './types';
import { htmlToText } from 'html-to-text';

function getTwitterClient() {
    const appKey = process.env.TWITTER_API_KEY;
    const appSecret = process.env.TWITTER_API_KEY_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        return null;
    }

    const client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
    });
    
    return client.readWrite;
}

function contentToText(content: Post['content']): string {
    if (typeof content === 'string') {
        return htmlToText(content);
    }
    if (Array.isArray(content)) {
        return content
            .filter(block => block.type === 'paragraph')
            .map(block => block.value)
            .join(' ');
    }
    return '';
}


export async function tweetNewPost(post: Post, siteUrl: string): Promise<{ success: boolean; message: string }> {
  const rwClient = getTwitterClient();

  if (!rwClient) {
    return { success: false, message: 'Twitter API credentials are not fully configured on the server.' };
  }
  
  const postUrl = `${siteUrl}/posts/${post.slug}`;
  const contentText = contentToText(post.content);
  const snippet = contentText.substring(0, 100);
  const tags = post.tags.map(t => `#${t.replace(/\s+/g, '')}`).slice(0, 3).join(' ');

  // Construct the tweet text, ensuring it's within the character limit
  let text = `${post.title}\n\n${snippet}...\n\nRead more: ${postUrl}\n\n${tags}`;
  if (text.length > 280) {
      const remainingLength = 280 - (post.title.length + postUrl.length + tags.length + 15);
      const shorterSnippet = contentText.substring(0, remainingLength);
      text = `${post.title}\n\n${shorterSnippet}...\n\nRead more: ${postUrl}\n\n${tags}`;
  }


  try {
    await rwClient.v2.tweet(text);
    return { success: true, message: 'Tweeted successfully.' };
  } catch (error) {
    console.error('Error sending tweet:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to tweet: ${message}` };
  }
}
