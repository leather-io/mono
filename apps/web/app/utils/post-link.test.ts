import { getPostHref } from './post-link';

describe('getPostHref', () => {
  it('returns correct URL for valid slug', () => {
    const expected = import.meta.env.DEV
      ? 'https://prosperous-combination-099461.framer.app/posts/test-slug'
      : 'https://leather.io/posts/test-slug';
    expect(getPostHref('test-slug')).toBe(expected);
  });

  it('handles empty slug gracefully', () => {
    const expected = import.meta.env.DEV
      ? 'https://prosperous-combination-099461.framer.app/posts/'
      : 'https://leather.io/posts/';
    expect(getPostHref('')).toBe(expected);
  });

  it('handles undefined slug gracefully', () => {
    const expected = import.meta.env.DEV
      ? 'https://prosperous-combination-099461.framer.app/posts/undefined'
      : 'https://leather.io/posts/undefined';
    expect(getPostHref(undefined as any)).toBe(expected);
  });
});
