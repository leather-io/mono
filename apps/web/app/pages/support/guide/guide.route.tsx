import { cmsClient } from '~/constants/cms-client';
import { Guide } from '~/pages/support/guide/guide';

import { HelpCenterGuideBySlugQueryResult, helpCenterGuideBySlugQuery } from '@leather.io/cms';

import { Route } from './+types/guide.route';

export async function loader({
  params,
}: Route.LoaderArgs): Promise<{ guide: NonNullable<HelpCenterGuideBySlugQueryResult> }> {
  const slug = params.guideSlug;
  const guide = await cmsClient.fetch(helpCenterGuideBySlugQuery, { slug });

  if (!guide) {
    throw new Error('Guide not found', { cause: 404 });
  }

  return { guide };
}

export default function GuideRoute() {
  return <Guide />;
}
