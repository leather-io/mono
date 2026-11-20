import { program } from 'commander';

import {
  registerChangelogCommands,
  registerFeatureMapCommands,
  registerFixIssueCommands,
  registerKernelCommands,
  registerLeanCommands,
  registerReviewGateCommands,
} from './commands/index.js';

program.name('lt').description('Leather monorepo tools').version('1.0.0');

registerChangelogCommands(program);
registerFeatureMapCommands(program);
registerFixIssueCommands(program);
registerKernelCommands(program);
registerLeanCommands(program);
registerReviewGateCommands(program);

await program.parseAsync();
