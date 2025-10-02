import { MetaDescriptor } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import { HelpCenter } from '~/pages/help-center/help-center';
import { handleSupportFormAction } from '~/utils/support/support-form-action';

import { LegacyHelpCenterPageQueryResult, legacyHelpCenterPageQuery } from '@leather.io/cms';

import { Route } from './+types/help-center.route';

export function meta() {
  return [
    { title: 'Guides – Leather' },
    { name: 'description', content: 'Leather wallet user guides for every stage' },
  ] satisfies MetaDescriptor[];
}

export async function action({ request }: Route.ActionArgs) {
  return handleSupportFormAction(request);
}

type LoaderResult = Promise<{
  categories: NonNullable<LegacyHelpCenterPageQueryResult>['categories'];
}>;
export async function loader(): LoaderResult {
  const categories = await cmsClient.fetch(legacyHelpCenterPageQuery);

  if (!categories) throw new Error('Categories not found', { cause: 404 });

  return categories;
}

export default function GuidesRoute() {
  return <HelpCenter />;
}
