import { getPostHref } from './post-link';

describe('getPostHref', () => {
  it('returns the in-app post path for a slug', () => {
    expect(getPostHref('test-slug')).toBe('/posts/test-slug');
  });

  it('trims whitespace around the slug', () => {
    expect(getPostHref('  test-slug ')).toBe('/posts/test-slug');
  });

  it('handles an empty slug', () => {
    expect(getPostHref('')).toBe('/posts/');
  });

  it('handles an undefined slug', () => {
    expect(getPostHref(undefined)).toBe('/posts/undefined');
  });

  it('passes full URLs through unchanged', () => {
    expect(getPostHref('https://example.com/a')).toBe('https://example.com/a');
  });
});
