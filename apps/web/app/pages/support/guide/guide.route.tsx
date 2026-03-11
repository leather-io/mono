import { redirect } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import { Guide } from '~/pages/support/guide/guide';

import { HelpCenterGuideBySlugQueryResult, helpCenterGuideBySlugQuery } from '@leather.io/cms';

import { Route } from './+types/guide.route';

export async function loader({
  params,
}: Route.LoaderArgs): Promise<{ guide: NonNullable<HelpCenterGuideBySlugQueryResult> } | Response> {
  const slug = params.guideSlug;
  const guide = await cmsClient.fetch(helpCenterGuideBySlugQuery, { slug });

  if (!guide) {
    return redirect(`/posts/${slug}`);
  }

  return { guide };
}

export default function GuideRoute() {
  return <Guide />;
}
