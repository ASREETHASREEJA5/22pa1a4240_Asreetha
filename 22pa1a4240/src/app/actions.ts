
'use server';

import { suggestShortcode, type SuggestShortcodeInput } from '@/ai/flows/suggest-shortcode';
import { findUrlByShortcode, getAllUrls, saveUrl } from '@/services/url-service';
import type { ShortenedUrl } from '@/types';

export async function suggestShortcodeAction(
  input: SuggestShortcodeInput
): Promise<{ shortcode: string } | { error: string }> {
  try {
    const result = await suggestShortcode(input);
    return result;
  } catch (error) {
    console.error('Error suggesting shortcode:', error);
    return { error: 'Failed to suggest a shortcode. Please try again.' };
  }
}

export async function createShortUrlsAction(
    urlsToCreate: Omit<ShortenedUrl, 'id' | 'shortUrl' | 'createdAt' | 'clicks' | 'clickData'>[],
    origin: string,
): Promise<{ urls: ShortenedUrl[], error?: string }> {
    const newUrls: ShortenedUrl[] = [];
    
    for (const urlData of urlsToCreate) {
        if (findUrlByShortcode(urlData.shortcode)) {
            return {
                urls: [],
                error: `The shortcode "${urlData.shortcode}" is already in use. Please choose another one.`,
            }
        }

        const newUrl: ShortenedUrl = {
            ...urlData,
            id: crypto.randomUUID(),
            shortUrl: `${origin}/${urlData.shortcode}`,
            createdAt: new Date().toISOString(),
            clicks: 0,
            clickData: [],
        };
        saveUrl(newUrl);
        newUrls.push(newUrl);
    }
    
    return { urls: newUrls };
}

export async function getShortUrlsAction(): Promise<ShortenedUrl[]> {
    return getAllUrls();
}

export const isShortcodeTakenAction = async (shortcode: string): Promise<boolean> => {
    return !!findUrlByShortcode(shortcode);
}

export const generateUniqueShortcodeAction = async (): Promise<string> => {
    let shortcode = '';
    do {
      shortcode = Math.random().toString(36).substring(2, 8);
    } while (await isShortcodeTakenAction(shortcode));
    return shortcode;
}