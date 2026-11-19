import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { CommandRunner } from '../ci/exec.js';
import { briefIssues, dispatch } from './dispatch.js';

describe('dispatch', () => {
  let runDir: string;
  beforeEach(() => {
    runDir = mkdtempSync(path.join(tmpdir(), 'fix-issue-dispatch-'));
    mkdirSync(path.join(runDir, 'briefs', 'bot'), { recursive: true });
  });
  afterEach(() => rmSync(runDir, { recursive: true, force: true }));

  function writeBrief(name: string, content: string) {
    const file = path.join(runDir, 'briefs', 'bot', name);
    writeFileSync(file, content);
    return file;
  }

  function fakeGh(status = 0) {
    const calls: (readonly string[])[] = [];
    function run(command: string, args: readonly string[]): ReturnType<CommandRunner> {
      calls.push([command, ...args]);
      return {
        status,
        stdout: '',
        stderr: status === 0 ? 'Created workflow_dispatch event\n' : 'HTTP 403\n',
      };
    }
    return { calls, run };
  }

  test('dispatches the workflow on dev with the brief read from its file', () => {
    const brief = writeBrief('fix-issue-123.md', '# #123: fee row\n');
    const gh = fakeGh();
    expect(dispatch({ runDir, issue: 123, repo: 'leather-io/mono', run: gh.run })).toBe(
      'Created workflow_dispatch event'
    );
    expect(gh.calls).toEqual([
      [
        'gh',
        'workflow',
        'run',
        'repo:fix-issue.yml',
        '--repo',
        'leather-io/mono',
        '--ref',
        'dev',
        '-f',
        'issue=123',
        '-F',
        `notes=@${brief}`,
      ],
    ]);
  });

  test('refuses a missing brief', () => {
    const gh = fakeGh();
    expect(() => dispatch({ runDir, issue: 7, repo: 'leather-io/mono', run: gh.run })).toThrow(
      /no brief at .*fix-issue-7\.md/
    );
    expect(gh.calls).toEqual([]);
  });

  test('refuses a brief over the size limit before calling GitHub', () => {
    writeBrief('fix-issue-8.md', 'x'.repeat(60_001));
    const gh = fakeGh();
    expect(() => dispatch({ runDir, issue: 8, repo: 'leather-io/mono', run: gh.run })).toThrow(
      /is 60001 bytes, over the 60000 byte limit/
    );
    expect(gh.calls).toEqual([]);
  });

  test('reports a refused dispatch with the command to hand on', () => {
    writeBrief('fix-issue-9.md', 'brief\n');
    expect(() =>
      dispatch({ runDir, issue: 9, repo: 'leather-io/mono', run: fakeGh(1).run })
    ).toThrow(/GitHub refused the dispatch: HTTP 403\n.*\ngh workflow run repo:fix-issue\.yml/);
  });

  test('reads the issues of a run from its brief file names', () => {
    writeBrief('fix-issue-82.md', 'brief\n');
    writeBrief('fix-issue-37.md', 'brief\n');
    writeBrief('notes.md', 'not a brief\n');
    expect(briefIssues(runDir)).toEqual([37, 82]);
  });

  test('fails when a run has no briefs', () => {
    expect(() => briefIssues(runDir)).toThrow(/holds no fix-issue-<n>\.md briefs/);
  });
});
