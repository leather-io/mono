import DOMPurify from 'dompurify';
import { vi } from 'vitest';

import { sanitizeContent } from './sanitize-content';

vi.mock('dompurify');

describe('sanitizeContent', () => {
  afterEach(() => {
    vi.resetAllMocks();
    // Clean up window if set
    // @ts-ignore
    delete global.window;
  });

  it('calls DOMPurify.sanitize in browser and returns its result', () => {
    // @ts-ignore
    global.window = {};
    const mockSanitize = vi.fn(() => 'sanitized-html');
    (DOMPurify.sanitize as any) = mockSanitize;
    const dirty = '<div>Hello<script>alert(1)</script>World</div>';
    expect(sanitizeContent(dirty)).toBe('sanitized-html');
    expect(mockSanitize).toHaveBeenCalledWith(dirty, { USE_PROFILES: { html: true } });
  });

  it('escapes HTML on SSR', () => {
    // @ts-ignore
    delete global.window;
    const dirty = '<div>Hello<script>alert(1)</script>World</div>';
    expect(sanitizeContent(dirty)).toBe(
      '&lt;div&gt;Hello&lt;script&gt;alert(1)&lt;/script&gt;World&lt;/div&gt;'
    );
  });

  it('returns safe HTML unchanged in browser if DOMPurify returns it', () => {
    // @ts-ignore
    global.window = {};
    const mockSanitize = vi.fn((dirty: string) => dirty);
    (DOMPurify.sanitize as any) = mockSanitize;
    const clean = '<b>Safe</b> content';
    expect(sanitizeContent(clean)).toBe('<b>Safe</b> content');
    expect(mockSanitize).toHaveBeenCalledWith(clean, { USE_PROFILES: { html: true } });
  });
});
