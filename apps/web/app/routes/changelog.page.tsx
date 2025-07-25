import { MetaDescriptor } from 'react-router';

import { Changelog } from '~/pages/changelog/changelog';
import { getChangelogEntries } from '~/utils/changelog';

import { Route } from './+types/changelog.page';

export function loader() {
  const entries = getChangelogEntries();
  return { entries };
}

export function meta() {
  return [
    { title: 'Changelog – Leather' },
    {
      name: 'description',
      content:
        'Stay up to date with the latest features, improvements, and bug fixes in Leather Wallet.',
    },
  ] satisfies MetaDescriptor[];
}

export default function ChangelogRoute({ loaderData }: Route.ComponentProps) {
  return <Changelog entries={loaderData.entries} />;
}
