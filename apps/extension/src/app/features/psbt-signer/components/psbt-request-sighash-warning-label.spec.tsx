import { renderToString } from 'react-dom/server';

import { PsbtRequestSighashWarningLabel } from './psbt-request-sighash-warning-label';

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

describe(PsbtRequestSighashWarningLabel.name, () => {
  test('warns generically for a mutable transaction', () => {
    const html = renderToString(<PsbtRequestSighashWarningLabel origin="https://app.test" />);

    expect(html).toContain('Be careful with this transaction');
    expect(html).toContain('https://app.test');
  });

  test('warns that the funds are not guaranteed when outputs are not committed', () => {
    const html = renderToString(
      <PsbtRequestSighashWarningLabel origin="https://evil.test" outputsNotGuaranteed />
    );

    expect(html).toContain('Signing does not guarantee where the funds go');
    expect(html).toContain('https://evil.test');
    expect(html).not.toContain('Be careful with this transaction');
  });
});
