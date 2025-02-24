import { tlds } from './tlds-list';

const tldRegex = tlds.join('|');
const urlRegex = new RegExp(`\\b.*\\s*\\.\\s*(${tldRegex})\\b`, 'gi');

const spamWords = ['won', 'win', 'click'];
export const spamReplacement = 'Suspicious token';

function spamUrlFilter(input: string) {
  return input.match(urlRegex);
}

function spamWordFilter(input: string): boolean {
  function containsSpam(element: string) {
    return input.toLowerCase().includes(element);
  }
  return spamWords.some(containsSpam);
}

interface SpamFilterArgs {
  input: string;
  whitelist: string[];
}

export function spamFilter({ input, whitelist }: SpamFilterArgs): string {
  if (whitelist.includes(input)) return input;

  const urlFound = spamUrlFilter(input);
  const spamWordsFound = spamWordFilter(input);

  if (urlFound || spamWordsFound) {
    return spamReplacement;
  }

  return input;
}
