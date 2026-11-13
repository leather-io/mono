import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

import { cmsConfig, createCmsClient } from '@leather.io/cms';

export const cmsClient = createCmsClient({
  ...cmsConfig,
  useCdn: false,
});

const builder = imageUrlBuilder(cmsClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
