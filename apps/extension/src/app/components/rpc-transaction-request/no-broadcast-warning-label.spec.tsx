import { renderToString } from 'react-dom/server';

import { NoBroadcastWarningLabel } from './no-broadcast-warning-label';

vi.mock('@leather.io/ui', () => ({
  Callout({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div>
        <span>{title}</span>
        <span>{children}</span>
      </div>
    );
  },
}));

describe(NoBroadcastWarningLabel.name, () => {
  test('warns that the origin receives the signed transaction', () => {
    const html = renderToString(<NoBroadcastWarningLabel origin="app.example.com" />);

    expect(html).toContain('broadcast this transaction');
    expect(html).toContain('Leather will sign this transaction and hand it to');
    expect(html).toContain('Continue only if you trust');
    expect(html).toContain('app.example.com');
  });
});
