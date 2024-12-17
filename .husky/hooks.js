import chalk from 'chalk';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const errors = new Map();
let hasErrors = false;
let stashCreated = false;
let stashName = `pre-push-stash-${Date.now()}`;
const hookType = process.argv[2]?.toUpperCase().replace('-', '_');

if (!hookType) {
  console.error("Hook type is required. Supported hooks: 'pre-commit', 'pre-push'");
  process.exit(1);
}

function runCommand(command, context) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    hasErrors = true;
    const existingErrors = errors.get(context) || [];
    errors.set(context, [...existingErrors, error.message]);
  }
}

function stashChanges() {
  try {
    const status = execSync('git status --porcelain').toString();

    if (status) {
      console.log(chalk.blue('Stashing changes...'));
      execSync(`git stash push -u -m "${stashName}"`, { stdio: 'inherit' });
      stashCreated = true;
    }
  } catch (error) {
    console.error('Failed to stash changes:', error.message);
    console.error('Cannot proceed with pre-push checks. Aborting.');
    process.exit(1);
  }
}

function restoreStashedChanges() {
  try {
    console.log(chalk.blue('Restoring stashed changes...'));
    const stashList = execSync('git stash list').toString();
    const stashIndex = stashList.split('\n').findIndex(line => line.includes(stashName));

    if (stashIndex === -1) {
      throw new Error(
        'Could not find our stash! Your changes may be in the stash list with a different name.'
      );
    }

    execSync(`git stash pop stash@{${stashIndex}} --quiet`, { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red.bold('❗CRITICAL: Failed to restore your changes from stash!'));
    console.error(chalk.red('Error:'), error.message);
    console.error('Your changes are still in the git stash. To restore them:');
    console.error('1. Run: git stash list');
    console.error(`2. Find the stash with message: "${stashName}"`);
    console.error('3. Run: git stash pop stash@{n} (where n is the stash number)');
    process.exit(1);
  }
}

try {
  const config = dotenv.config().parsed;
  const scripts = config[hookType]?.split(',').map(s => s.trim()) || [];

  if (!scripts.length) {
    process.exit(0);
  }

  if (hookType === 'PRE_COMMIT') {
    // Only check staged files and fix them with Prettier and ESLint as necessary,
    // by replacing 'lint' and 'format' scripts with lint-staged commands.
    const lintStagedCommands = scripts
      .filter(script => ['lint', 'format'].includes(script))
      .map(script => {
        if (script === 'lint') return 'eslint --cache --max-warnings 0 --fix';
        if (script === 'format') return 'prettier --write';
      });

    if (lintStagedCommands.length > 0) {
      const lintStagedConfig = {
        '{packages,apps}/**/src/**/*.{ts,tsx}': lintStagedCommands,
      };

      runCommand(
        `echo '${JSON.stringify(lintStagedConfig)}' | npx lint-staged --config -`,
        'lint & format'
      );
    }

    scripts
      .filter(script => !['lint', 'format'].includes(script))
      .forEach(script => void runCommand(`pnpm ${script}`, script));
  } else {
    stashChanges();
    scripts
      .map(script => (script === 'format' ? 'format:check' : script))
      .forEach(script => void runCommand(`pnpm ${script}`, script));
  }

  if (hasErrors) {
    console.log(
      [
        chalk.red('The following checks failed. See output above for more details.'),
        chalk.red('─'.repeat(72)),
      ].join('\n')
    );

    errors.forEach((errorList, context) => {
      console.log(chalk.red(`✖ ${context}`));
    });
    console.log('\n');

    throw new Error('Script execution failed');
  }

  console.log('\n');
  console.log('✨ All checks passed.');
  console.log('─'.repeat(40));
  scripts.forEach(script => {
    console.log(chalk.green(` ✓`), script);
  });
  console.log('\n');
} catch (error) {
  if (error.message !== 'Script execution failed') {
    console.error(chalk.red('Unexpected error:'), error.message);
  }
  process.exitCode = 1;
} finally {
  if (stashCreated) {
    restoreStashedChanges();
  }
}
