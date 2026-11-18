import { program } from 'commander';

import {
  registerChangelogCommands,
  registerFeatureMapCommands,
  registerFixIssueCommands,
  registerVerifyCommands,
} from './commands/index.js';

program.name('lt').description('Leather monorepo tools').version('1.0.0');

registerChangelogCommands(program);
registerFeatureMapCommands(program);
registerFixIssueCommands(program);
registerVerifyCommands(program);

await program.parseAsync();
