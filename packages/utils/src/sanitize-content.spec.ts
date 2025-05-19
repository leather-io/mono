import { sanitizeContent } from './sanitize-content';

describe('sanitizeContent', () => {
  it('removes <script> tags in browser', () => {
    // Simulate browser environment
    (global as any).window = {};
    (global as any).DOMPurify = { sanitize: (dirty: string) => dirty.replace(/<script.*?>.*?<\/script>/gi, '') };
    const dirty = '<div>Hello<script>alert(1)</script>World</div>';
    expect(sanitizeContent(dirty)).toBe('<div>HelloWorld</div>');
    delete (global as any).window;
    delete (global as any).DOMPurify;
  });

  it('escapes HTML on SSR', () => {
    // Simulate SSR (no window)
    const dirty = '<div>Hello<script>alert(1)</script>World</div>';
    expect(sanitizeContent(dirty)).toBe('&lt;div&gt;Hello&lt;script&gt;alert(1)&lt;/script&gt;World&lt;/div&gt;');
  });

  it('returns safe HTML unchanged in browser', () => {
    (global as any).window = {};
    (global as any).DOMPurify = { sanitize: (dirty: string) => dirty };
    const clean = '<b>Safe</b> content';
    expect(sanitizeContent(clean)).toBe('<b>Safe</b> content');
    delete (global as any).window;
    delete (global as any).DOMPurify;
  });
}); 