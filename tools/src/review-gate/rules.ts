import type { Tier } from './decision.js';
import type { PullRequest, PullRequestFile } from './schemas.js';

const maxChangedFiles = 30;
const maxChangedLines = 1000;
const maxPromptBytes = 100_000;
const shownFileCount = 5;

const assetExtensionPattern =
  /\.(?:png|jpe?g|gif|webp|avif|ico|bmp|woff2?|ttf|otf|eot|mp4|webm|mov|mp3|wav|pdf)$/i;

type ClassifiedPullRequest = Pick<PullRequest, 'title' | 'body'>;

interface RuleOptions {
  readonly baseBlobs?: ReadonlyMap<string, string>;
  readonly sensitiveFiles?: readonly string[];
}

export function needsBaseBlob(file: PullRequestFile): boolean {
  return (
    file.patch === undefined &&
    file.status === 'renamed' &&
    file.additions + file.deletions === 0 &&
    !assetExtensionPattern.test(file.filename)
  );
}

function hasHiddenDiff(file: PullRequestFile, baseBlobs: ReadonlyMap<string, string>): boolean {
  if (file.patch !== undefined || file.status === 'removed') return false;
  if (file.additions + file.deletions > 0) return true;
  if (needsBaseBlob(file)) {
    return (
      file.previous_filename === undefined || baseBlobs.get(file.previous_filename) !== file.sha
    );
  }
  return !assetExtensionPattern.test(file.filename);
}

function findHiddenDiffs(
  files: readonly PullRequestFile[],
  baseBlobs: ReadonlyMap<string, string> = new Map()
): string[] {
  return files.filter(file => hasHiddenDiff(file, baseBlobs)).map(file => file.filename);
}

function summariseFiles(filenames: readonly string[]): string {
  const shown = filenames.slice(0, shownFileCount).join(', ');
  const remaining = filenames.length - shownFileCount;
  return remaining > 0 ? `${shown} and ${remaining} more` : shown;
}

export function buildPrompt(
  pullRequest: ClassifiedPullRequest,
  files: readonly PullRequestFile[]
): string {
  const payload = {
    title: pullRequest.title,
    description: pullRequest.body ?? '',
    files: files.map(file => ({
      path: file.filename,
      previousPath: file.previous_filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch ?? '',
    })),
  };
  return `Classify this pull request. It is given as JSON.\n\n${JSON.stringify(payload, null, 2)}`;
}

export function requireTwoReviews(reason: string): Tier {
  return { reviews: 2, confidence: 'high', reason, summary: reason };
}

export function decideByRules(
  pullRequest: ClassifiedPullRequest,
  files: readonly PullRequestFile[],
  { baseBlobs, sensitiveFiles = [] }: RuleOptions = {}
): Tier | null {
  if (sensitiveFiles.length > 0) {
    return requireTwoReviews(`Touches sensitive paths: ${summariseFiles(sensitiveFiles)}.`);
  }
  if (files.length > maxChangedFiles) {
    return requireTwoReviews(`Changes ${files.length} files, more than ${maxChangedFiles}.`);
  }
  const changedLines = files.reduce((sum, file) => sum + file.additions + file.deletions, 0);
  if (changedLines > maxChangedLines) {
    return requireTwoReviews(`Changes ${changedLines} lines, more than ${maxChangedLines}.`);
  }
  const hiddenDiffs = findHiddenDiffs(files, baseBlobs);
  if (hiddenDiffs.length > 0) {
    return requireTwoReviews(`GitHub omits the diff for ${summariseFiles(hiddenDiffs)}.`);
  }
  if (Buffer.byteLength(buildPrompt(pullRequest, files)) > maxPromptBytes) {
    return requireTwoReviews(
      `The diff is larger than the ${maxPromptBytes} bytes the classifier reads.`
    );
  }
  return null;
}
