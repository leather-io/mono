import { MetaDescriptor } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import { HelpCenter } from '~/pages/help-center/help-center';

import { LegacyHelpCenterPageQueryResult, legacyHelpCenterPageQuery } from '@leather.io/cms';

export function meta() {
  return [
    { title: 'Guides – Leather' },
    { name: 'description', content: 'Leather wallet user guides for every stage' },
  ] satisfies MetaDescriptor[];
}

export async function loader(): Promise<{
  categories: NonNullable<LegacyHelpCenterPageQueryResult>['categories'];
}> {
  const categories = await cmsClient.fetch(legacyHelpCenterPageQuery);

  if (!categories) {
    throw new Error('Categories not found', { cause: 404 });
  }

  return {
    categories: categories.categories,
  };
}

export default function GuidesRoute() {
  return <HelpCenter />;
}
