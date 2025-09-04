import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

import { createCmsClient } from '@leather.io/cms';

export const cmsClient = createCmsClient({
  projectId: '70cnou7r',
  dataset: 'production',
  apiVersion: '2025-09-04',
  useCdn: false,
});

const builder = imageUrlBuilder(cmsClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
