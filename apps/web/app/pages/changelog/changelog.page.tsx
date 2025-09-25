import { Route } from './+types/changelog.route';
import { ChangelogEntry } from './components/changelog-entry';
import { ChangelogEntryLayout, ChangelogPageLayout } from './components/changelog-page-layout';

interface ChangelogPageProps {
  entries: Route.ComponentProps['loaderData'];
}
export function ChangelogPage({ entries }: ChangelogPageProps) {
  return (
    <ChangelogPageLayout>
      {entries.map((entry, index) => (
        <ChangelogEntry entry={entry} key={entry._id}>
          <ChangelogEntryLayout
            leftColumn={
              <>
                <ChangelogEntry.PublishDate />
                <ChangelogEntry.Title />
              </>
            }
            isLast={index === entries.length - 1}
          >
            <ChangelogEntry.Image />
            <ChangelogEntry.Body mt="space.01" />
          </ChangelogEntryLayout>
        </ChangelogEntry>
      ))}
    </ChangelogPageLayout>
  );
}
