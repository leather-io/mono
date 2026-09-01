import { getVersionWithRandomSuffix } from './build-metadata';

test('keeps the package version for main and publishing builds', () => {
  expect(getVersionWithRandomSuffix('1.2.3', 'refs/heads/main', false, 123)).toBe('1.2.3');
  expect(getVersionWithRandomSuffix('1.2.3', 'feature/vite', true, 123)).toBe('1.2.3');
});

test('adds a random numeric component to non-main builds', () => {
  expect(getVersionWithRandomSuffix('1.2.3', 'feature/vite', false, 123)).toBe('1.2.3.123');
});
