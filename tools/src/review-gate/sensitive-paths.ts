import { minimatch } from 'minimatch';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { getMonorepoRoot } from '../utils/paths.js';
import type { PullRequestFile } from './schemas.js';

const sensitivePathsFile = '.github/review-gate/sensitive-paths.yml';
const listHeader = 'sensitive:';
const globLinePattern = /^\s+- '(.+)'$/;

export function parseSensitiveGlobs(text: string): string[] {
  const [header, ...entries] = text.split('\n').filter(line => line.trim() !== '');
  if (header?.trimEnd() !== listHeader) {
    throw new Error(`${sensitivePathsFile} must start with ${listHeader}`);
  }
  return entries.map(line => {
    const glob = globLinePattern.exec(line.trimEnd())?.[1];
    if (glob === undefined) {
      throw new Error(`${sensitivePathsFile} has a line that is not a quoted glob: ${line}`);
    }
    return glob;
  });
}

export function readSensitiveGlobs(): string[] {
  return parseSensitiveGlobs(
    readFileSync(path.join(getMonorepoRoot(), sensitivePathsFile), 'utf8')
  );
}

export function isSensitivePath(filePath: string, globs: readonly string[]): boolean {
  return globs.some(glob => minimatch(filePath, glob, { dot: true }));
}

export function findSensitiveFiles(
  files: readonly PullRequestFile[],
  globs: readonly string[]
): string[] {
  const paths = files.flatMap(file =>
    file.previous_filename === undefined ? [file.filename] : [file.filename, file.previous_filename]
  );
  return [...new Set(paths)].filter(filePath => isSensitivePath(filePath, globs));
}
