import { ClientConfig, createClient } from '@sanity/client';

export function createCmsClient(config: ClientConfig) {
  return createClient(config);
}
