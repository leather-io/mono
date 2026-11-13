import { type MetaDescriptor } from 'react-router';

import { type Route } from './+types/changelog.route';
import { getChangelogEntries } from './changelog.data';
import { ChangelogPage } from './changelog.page';

export function meta() {
  return [
    { title: 'Changelog – Leather' },
    { name: 'description', content: 'Latest updates and changes' },
    { rel: 'alternate', type: 'application/rss+xml', href: './changelog.xml' },
  ] satisfies MetaDescriptor[];
}

export function loader() {
  return getChangelogEntries();
}

export default function ChangelogRoute({ loaderData }: Route.ComponentProps) {
  return <ChangelogPage entries={loaderData} />;
}
