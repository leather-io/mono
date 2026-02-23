import { redirect } from 'react-router';

import { cmsClient } from '~/constants/cms-client';

import { helpCenterGuideBySlugQuery } from '@leather.io/cms';

import { Route } from './+types/support-guide-redirect.route';

export async function loader({ params }: Route.LoaderArgs) {
  const guide = await cmsClient.fetch(helpCenterGuideBySlugQuery, { slug: params.slug });

  if (!guide?.categories?.[0]?.slug?.current) {
    throw new Error('Guide not found', { cause: 404 });
  }

  return redirect(`/support/${guide.categories[0].slug.current}/${params.slug}`, 301);
}
