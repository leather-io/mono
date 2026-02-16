import { describe, expect, it } from 'vitest';

import { toColumnMajorRows } from './to-column-major-rows';

describe(toColumnMajorRows.name, () => {
  it('reorders items so columns are sorted after chunking', () => {
    // Given 6 items with rowSize 3, we get 2 rows.
    // Column-major: [1,3,5, 2,4,6] → chunk(3) → [[1,3,5],[2,4,6]]
    // Columns read top-to-bottom: [1,2], [3,4], [5,6] — all sorted.
    expect(toColumnMajorRows(3)([1, 2, 3, 4, 5, 6])).toEqual([1, 3, 5, 2, 4, 6]);
  });

  it('handles items that do not divide evenly', () => {
    // 7 items, rowSize 3 → numRows = 3
    // Row 0: indices 0,3,6 → [1,4,7]
    // Row 1: indices 1,4    → [2,5]
    // Row 2: indices 2,5    → [3,6]
    expect(toColumnMajorRows(3)([1, 2, 3, 4, 5, 6, 7])).toEqual([1, 4, 7, 2, 5, 3, 6]);
  });

  it('returns empty array for empty input', () => {
    expect(toColumnMajorRows(5)([])).toEqual([]);
  });

  it('returns same array when rowSize >= array length', () => {
    expect(toColumnMajorRows(10)([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('works with rowSize of 1', () => {
    expect(toColumnMajorRows(1)([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('works with strings', () => {
    expect(toColumnMajorRows(2)(['a', 'b', 'c', 'd'])).toEqual(['a', 'c', 'b', 'd']);
  });
});
