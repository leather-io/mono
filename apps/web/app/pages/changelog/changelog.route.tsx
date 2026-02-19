import { MetaDescriptor } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import { canonicalUrl } from '~/constants/meta-tags';

import { changelogQuery } from '@leather.io/cms';

import { Route } from './+types/changelog.route';
import { ChangelogPage } from './changelog.page';

export function meta() {
  return [
    { title: 'Changelog – Leather' },
    { name: 'description', content: 'Latest updates and changes' },
    { rel: 'alternate', type: 'application/rss+xml', href: './changelog.xml' },
    canonicalUrl('/changelog'),
  ] satisfies MetaDescriptor[];
}

export async function loader() {
  return await cmsClient.fetch(changelogQuery);
}

export default function ChangelogRoute({ loaderData }: Route.ComponentProps) {
  return <ChangelogPage entries={loaderData} />;
}
