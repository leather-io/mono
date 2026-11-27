import path from 'node:path';

export interface FixIssuePaths {
  readonly root: string;
  readonly workDir: string;
  readonly issueFile: string;
  readonly notesFile: string;
  readonly statusFile: string;
  readonly verifyReport: string;
  readonly reviewFile: string;
  readonly reviewSnapshot: string;
  readonly runFile: string;
  readonly roundsDir: string;
  readonly patchFile: string;
  readonly applyDir: string;
  readonly screenshotSpecsDir: string;
  readonly screenshotsDir: string;
  readonly feedbackFile: string;
  readonly reviseFile: string;
  readonly pullRequestFile: string;
  readonly pullRequestDiff: string;
}

const defaultWorkDir = 'tmp/fix-issue';

export function fixIssuePaths(root: string, workDir = defaultWorkDir): FixIssuePaths {
  const dir = path.join(root, workDir);
  return {
    root,
    workDir: dir,
    issueFile: path.join(dir, 'issue.md'),
    notesFile: path.join(dir, 'notes.md'),
    statusFile: path.join(dir, 'status.json'),
    verifyReport: path.join(dir, 'verify.md'),
    reviewFile: path.join(dir, 'review.json'),
    reviewSnapshot: path.join(dir, 'review-snapshot.txt'),
    runFile: path.join(dir, 'run.json'),
    roundsDir: path.join(dir, 'rounds'),
    patchFile: path.join(dir, 'fix.patch'),
    applyDir: path.join(dir, 'apply'),
    screenshotSpecsDir: path.join(dir, 'screenshot-specs'),
    screenshotsDir: path.join(dir, 'screenshots'),
    feedbackFile: path.join(dir, 'feedback.md'),
    reviseFile: path.join(dir, 'revise.json'),
    pullRequestFile: path.join(dir, 'pull-request.md'),
    pullRequestDiff: path.join(dir, 'pull-request.diff'),
  };
}
