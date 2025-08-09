#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';

function extractLinguiMessages() {
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  const hasMobileSrcChanges = stagedFiles
    .split('\n')
    .filter(Boolean)
    .some(
      file => file.startsWith('apps/mobile/src/') && (file.endsWith('.tsx') || file.endsWith('.ts'))
    );

  if (!hasMobileSrcChanges) {
    return;
  }

  console.log(chalk.blue('📱 Detected changes in apps/mobile/src - extracting lingui messages...'));

  execSync('cd apps/mobile && pnpm lingui:extract', {
    stdio: 'inherit',
    encoding: 'utf8',
  });

  const messageFilesStatus = execSync('git status --porcelain apps/mobile/src/i18n/locales/', {
    encoding: 'utf8',
  });

  if (messageFilesStatus.trim()) {
    execSync('git add apps/mobile/src/i18n/locales/**/*.po', {
      stdio: 'inherit',
    });
    console.log(chalk.green('✓ Lingui messages extracted and staged'));
  } else {
    console.log(chalk.gray('✓ No message updates needed'));
  }
}

function handleExtractionError(error) {
  console.error(chalk.red('✖ Failed to extract lingui messages:'), error.message);
  console.error(chalk.yellow('  Please run "pnpm lingui:extract" manually in apps/mobile/'));
}

function handleUnexpectedError(error) {
  console.error(chalk.red('✖ Error checking for mobile src changes:'), error.message);
}

function main() {
  try {
    extractLinguiMessages();
  } catch (error) {
    if (error.message?.includes('lingui') || error.message?.includes('extract')) {
      handleExtractionError(error);
    } else {
      handleUnexpectedError(error);
    }
  }
}

main();