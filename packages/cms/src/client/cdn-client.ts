import { createCmsClient } from './client';

export const cmsConfig = {
  projectId: '70cnou7r',
  dataset: 'production',
  apiVersion: '2024-01-01',
} as const;

export const cmsCdnClient = createCmsClient({
  ...cmsConfig,
  useCdn: true,
});
