#!/usr/bin/env node
import chalk from 'chalk';
import { execSync } from 'child_process';

const mobileSrcDir = 'apps/mobile/src/';
const localesDir = 'apps/mobile/src/i18n/locales/';

function extractLinguiMessages() {
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
  const hasMobileSrcChanges = stagedFiles
    .split('\n')
    .filter(Boolean)
    .some(file => file.startsWith(mobileSrcDir) && (file.endsWith('.tsx') || file.endsWith('.ts')));

  if (!hasMobileSrcChanges) return;

  console.log(chalk.blue('📱 Detected changes in the mobile app - extracting lingui messages...'));

  execSync('cd apps/mobile && lingui extract $(git diff --name-only --staged)', {
    stdio: 'inherit',
    encoding: 'utf8',
  });

  const messageFilesStatus = execSync(`git status --porcelain ${localesDir}`, {
    encoding: 'utf8',
  });

  if (messageFilesStatus.trim()) {
    execSync(`git add ${localesDir}**/*.po`, {
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
