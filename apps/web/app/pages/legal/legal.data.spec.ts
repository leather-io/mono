import { describe, expect, test } from 'vitest';

import { privacyPolicyPage, termsPage } from './legal.data';

describe('legal pages', () => {
  test.each([privacyPolicyPage, termsPage])('$path keeps its last-updated date', page => {
    expect(page.body.startsWith('**Last updated**: August 31, 2023')).toBe(true);
  });

  test('the terms link to the privacy policy page', () => {
    expect(termsPage.body).toContain('(https://leather.io/privacy-policy)');
  });
});
