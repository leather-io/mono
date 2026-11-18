import { describe, expect, test } from 'vitest';

import { cell } from './render-markdown.js';

describe(cell.name, () => {
  test('escapes backslashes before pipes and flattens newlines', () => {
    expect(cell('a\\b | c\nd')).toBe('a\\\\b \\| c d');
    expect(cell('plain')).toBe('plain');
  });
});
