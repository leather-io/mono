import { execFileSync } from 'node:child_process';

import packageJson from '../package.json' with { type: 'json' };

const mainBranches = new Set(['main', 'refs/heads/main']);

function executeGitCommand(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

export function getVersionWithRandomSuffix(
  packageVersion: string,
  branchName: string,
  isPublishing: boolean,
  randomNumber = Math.floor(Math.random() * 1000)
) {
  if (mainBranches.has(branchName) || isPublishing) return packageVersion;
  return `${packageVersion}.${randomNumber}`;
}

const branchName =
  process.env.BRANCH_NAME ??
  process.env.GITHUB_REF ??
  executeGitCommand(['rev-parse', '--abbrev-ref', 'HEAD']);
const commitSha = process.env.COMMIT_SHA || executeGitCommand(['rev-parse', 'HEAD']);
const isPublishing = process.env.IS_PUBLISHING === 'true';

export const buildMetadata = {
  branchName,
  commitSha,
  version: getVersionWithRandomSuffix(packageJson.version, branchName, isPublishing),
};
