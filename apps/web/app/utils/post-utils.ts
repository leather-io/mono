import { removeTrailingPeriod } from './string-utils';

/**
 * Get a formatted post prompt without trailing periods
 * @param prompt The prompt content from a post
 * @returns The formatted prompt
 */
export function formatPostPrompt(prompt: string | undefined | null): string {
  return removeTrailingPeriod(prompt);
}

/**
 * Get a formatted post sentence without trailing periods
 * @param sentence The sentence content from a post
 * @returns The formatted sentence
 */
export function formatPostSentence(sentence: string | undefined | null): string {
  return removeTrailingPeriod(sentence);
}

/**
 * Formats any post text content by removing trailing periods
 * @param text Any text content from a post
 * @returns The formatted text
 */
export function formatPostContent(text: string | undefined | null): string {
  return removeTrailingPeriod(text);
} 