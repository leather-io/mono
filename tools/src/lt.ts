import { program } from 'commander';

import {
  registerBotPrApprovalsCommands,
  registerChangelogCommands,
  registerFeatureMapCommands,
  registerFixIssueCommands,
} from './commands/index.js';

program.name('lt').description('Leather monorepo tools').version('1.0.0');

registerBotPrApprovalsCommands(program);
registerChangelogCommands(program);
registerFeatureMapCommands(program);
registerFixIssueCommands(program);

await program.parseAsync();
