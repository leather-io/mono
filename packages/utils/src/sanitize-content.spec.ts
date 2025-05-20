import { sanitizeContent } from './sanitize-content';

describe('sanitizeContent', () => {
  it('calls DOMPurify.sanitize in browser and returns its result', () => {
    // Simulate browser environment
    (global as any).window = {};
    const mockSanitize = jest.fn(() => 'sanitized-html');
    (global as any).DOMPurify = { sanitize: mockSanitize };
    const dirty = '<div>Hello<script>alert(1)</script>World</div>';
    expect(sanitizeContent(dirty)).toBe('sanitized-html');
    expect(mockSanitize).toHaveBeenCalledWith(dirty, { USE_PROFILES: { html: true } });
    delete (global as any).window;
    delete (global as any).DOMPurify;
  });

  it('escapes HTML on SSR', () => {
    // Simulate SSR (no window)
    const dirty = '<div>Hello<script>alert(1)</script>World</div>';
    expect(sanitizeContent(dirty)).toBe('&lt;div&gt;Hello&lt;script&gt;alert(1)&lt;/script&gt;World&lt;/div&gt;');
  });

  it('returns safe HTML unchanged in browser if DOMPurify returns it', () => {
    (global as any).window = {};
    const mockSanitize = jest.fn((dirty: string) => dirty);
    (global as any).DOMPurify = { sanitize: mockSanitize };
    const clean = '<b>Safe</b> content';
    expect(sanitizeContent(clean)).toBe('<b>Safe</b> content');
    expect(mockSanitize).toHaveBeenCalledWith(clean, { USE_PROFILES: { html: true } });
    delete (global as any).window;
    delete (global as any).DOMPurify;
  });
}); 