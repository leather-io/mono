import { describe, expect, test } from 'vitest';

import { fixIssuePaths } from './paths.js';

describe('fixIssuePaths', () => {
  test('puts every file under tmp/fix-issue in the repository', () => {
    const paths = fixIssuePaths('/repo');
    expect(paths.root).toBe('/repo');
    expect(paths.workDir).toBe('/repo/tmp/fix-issue');
    expect(paths.statusFile).toBe('/repo/tmp/fix-issue/status.json');
    expect(paths.screenshotsDir).toBe('/repo/tmp/fix-issue/screenshots');
  });

  test('takes another work directory', () => {
    expect(fixIssuePaths('/repo', 'tmp/other').reviewFile).toBe('/repo/tmp/other/review.json');
  });
});
