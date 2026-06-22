import { recurseAccountsForActivity } from './account-restore';

describe(recurseAccountsForActivity.name, () => {
  test('case of account with activity at 6th index only', async () => {
    const mockHasActivityFn = vi.fn().mockImplementation((index: number) => {
      if (index <= 3) return true;
      return false;
    });
    const result = await recurseAccountsForActivity({
      doesAddressHaveActivityFn: mockHasActivityFn,
    });
    expect(result).toBe(3);
  });

  test('case of account with activity at 10th index only', async () => {
    const mockHasActivityFn = vi.fn().mockImplementation((index: number) => {
      if (index === 10) return true;
      return false;
    });
    const result = await recurseAccountsForActivity({
      doesAddressHaveActivityFn: mockHasActivityFn,
    });
    expect(result).toBe(10);
    // Index + Min accounts to check + 1
    expect(mockHasActivityFn.mock.calls.length).toBe(35);
  });

  test('case of account with activity until 80th account', async () => {
    const mockHasActivityFn = vi.fn().mockImplementation((index: number) => {
      if (index < 80) return true;
      return false;
    });
    const result = await recurseAccountsForActivity({
      doesAddressHaveActivityFn: mockHasActivityFn,
    });
    expect(result).toBe(79);
    expect(mockHasActivityFn.mock.calls.length).toBe(55);
  });

  test('does not probe indices at or below the known highest account index', async () => {
    const mockHasActivityFn = vi.fn().mockImplementation((index: number) => index <= 52);
    const result = await recurseAccountsForActivity({
      doesAddressHaveActivityFn: mockHasActivityFn,
      fromAccountIndex: 50,
    });
    expect(result).toBe(52);
    expect(mockHasActivityFn.mock.calls.every(([index]) => index > 50)).toBe(true);
  });

  test('returns the known highest account index when no further activity exists', async () => {
    const mockHasActivityFn = vi.fn().mockResolvedValue(false);
    const result = await recurseAccountsForActivity({
      doesAddressHaveActivityFn: mockHasActivityFn,
      fromAccountIndex: 7,
    });
    expect(result).toBe(7);
  });

  test('reports progress incrementally as higher activity is discovered', async () => {
    const mockHasActivityFn = vi.fn().mockImplementation((index: number) => index < 80);
    const found: number[] = [];
    const result = await recurseAccountsForActivity({
      doesAddressHaveActivityFn: mockHasActivityFn,
      onActivityFound: index => found.push(index),
    });
    expect(result).toBe(79);
    expect(found.length).toBeGreaterThan(1);
    expect(found).toStrictEqual([...found].sort((a, b) => a - b));
    expect(new Set(found).size).toBe(found.length);
    expect(found[found.length - 1]).toBe(79);
  });

  test('does not report progress when no activity exists beyond the known floor', async () => {
    const mockHasActivityFn = vi.fn().mockResolvedValue(false);
    const found: number[] = [];
    await recurseAccountsForActivity({
      doesAddressHaveActivityFn: mockHasActivityFn,
      fromAccountIndex: 7,
      onActivityFound: index => found.push(index),
    });
    expect(found).toStrictEqual([]);
  });
});
