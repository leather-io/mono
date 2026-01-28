import { program } from 'commander';

import { registerChangelogCommands } from './commands/index.js';

program.name('lt').description('Leather monorepo tools').version('1.0.0');

registerChangelogCommands(program);

program.parse();
