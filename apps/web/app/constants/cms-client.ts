import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

import { cmsConfig, createCmsClient } from '@leather.io/cms';

export const cmsClient = createCmsClient({
  ...cmsConfig,
  useCdn: false,
});

// Per-request options for non-critical marketing reads (news, posts index, changelog strip):
// a slow Sanity response degrades the page to an empty list instead of hanging the request.
export const marketingCmsRequestOptions = { timeout: 5_000 } as const;

const builder = imageUrlBuilder(cmsClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export function getBlockText(
  block?: {
    children?: {
      text?: string;
    }[];
  }[],
  lineBreakChar = '↵ '
) {
  return (
    block?.reduce((a, c, i) => {
      const text = c.children?.flatMap(c => c.text ?? '').join('') || '';
      return a + text + (i !== block.length - 1 ? lineBreakChar : '');
    }, '') || ''
  );
}
