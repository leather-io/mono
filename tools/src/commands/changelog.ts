import type { Command } from 'commander';

import { cutRelease, syncUnpublished } from '../changelog/index.js';

export function registerChangelogCommands(program: Command): void {
  const changelog = program.command('changelog').description('Changelog management commands');

  changelog
    .command('sync')
    .description('Sync unpublished changelog entries from release-please versions')
    .requiredOption('--app <app>', 'App to sync (mobile|extension)')
    .action(syncUnpublished);

  changelog
    .command('cut')
    .description('Cut a release by moving unpublished changes to a released section')
    .requiredOption('--app <app>', 'App to cut release for (mobile|extension)')
    .action(cutRelease);
}
