import path from 'node:path';

import { getMonorepoRoot } from '../utils/paths.js';

export function promptPath(name: string): string {
  return path.join(getMonorepoRoot(), '.github', 'prompts', `${name}.md`);
}
