import { Route } from './+types/changelog.route';
import { ChangelogEntry } from './components/changelog-entry';
import { ChangelogEntryLayout, ChangelogPageLayout } from './components/changelog-page-layout';

interface ChangelogPageProps {
  entries: Route.ComponentProps['loaderData'];
}
export function ChangelogPage({ entries }: ChangelogPageProps) {
  return (
    <ChangelogPageLayout>
      {entries.map(entry => (
        <ChangelogEntry entry={entry} key={entry._id}>
          <ChangelogEntryLayout leftColumn={<ChangelogEntry.PublishDate />}>
            <ChangelogEntry.Title />
            <ChangelogEntry.Image />
            <ChangelogEntry.Body mt="space.03" />
          </ChangelogEntryLayout>
        </ChangelogEntry>
      ))}
    </ChangelogPageLayout>
  );
}
