import { marketingMeta } from '~/pages/marketing/shared/marketing-meta';
import { contentMeta } from '~/pages/redirects/content-error-boundary';
import {
  type ContentGuide,
  cmsContentFetchers,
  loadGuideBySlug,
  supportGuidePath,
} from '~/pages/redirects/content-slug-resolver';
import { Guide } from '~/pages/support/guide/guide';

import { type Route } from './+types/guide.route';

export { ContentErrorBoundary as ErrorBoundary } from '~/pages/redirects/content-error-boundary';

export function meta({ loaderData, error, params }: Route.MetaArgs) {
  if (!loaderData) return contentMeta({ error });
  const { guide } = loaderData;
  return marketingMeta({
    title: `${guide.title} – Leather`,
    path: supportGuidePath(params.guideSlug),
    description: guide.summary || undefined,
  });
}

export async function loader({
  params,
  request,
}: Route.LoaderArgs): Promise<{ guide: ContentGuide }> {
  return loadGuideBySlug(params.guideSlug, request, cmsContentFetchers);
}

export default function GuideRoute() {
  return <Guide />;
}
