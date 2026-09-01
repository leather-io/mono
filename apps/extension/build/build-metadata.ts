import { execFileSync } from 'node:child_process';

import packageJson from '../package.json' with { type: 'json' };

const mainBranch = 'refs/heads/main';

function executeGitCommand(args: string[]) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

export function getVersionWithRandomSuffix(
  packageVersion: string,
  branchName: string,
  isPublishing: boolean,
  randomNumber = Math.floor(Math.random() * 1000)
) {
  if (branchName === mainBranch || !branchName || isPublishing) return packageVersion;
  return `${packageVersion}.${randomNumber}`;
}

const branchName = executeGitCommand(['rev-parse', '--abbrev-ref', 'HEAD']);
const commitSha = process.env.COMMIT_SHA ?? executeGitCommand(['rev-parse', 'HEAD']);
const isPublishing = Boolean(process.env.IS_PUBLISHING);

export const buildMetadata = {
  branchName,
  commitSha,
  version: getVersionWithRandomSuffix(packageJson.version, branchName, isPublishing),
};
