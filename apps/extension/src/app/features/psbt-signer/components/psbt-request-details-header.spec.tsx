import { renderToString } from 'react-dom/server';

import { createMoney } from '@leather.io/utils';

import { type PsbtSignerContext, PsbtSignerProvider } from '../psbt-signer.context';
import { PsbtRequestDetailsHeader } from './psbt-request-details-header';

vi.mock('@leather.io/ui', () => ({
  ErrorTriangleIcon: () => null,
  LockIcon: () => null,
  UnlockIcon: () => null,
}));

vi.mock('@app/ui/components/badge/badge-with-tooltip', () => ({
  BadgeWithTooltip({ label, variant }: { label: string; variant: string }) {
    return <span data-variant={variant}>{label}</span>;
  },
}));

const baseContext: PsbtSignerContext = {
  addressNativeSegwit: '',
  addressTaproot: '',
  addressNativeSegwitTotal: createMoney(0, 'BTC'),
  addressTaprootTotal: createMoney(0, 'BTC'),
  fee: createMoney(0, 'BTC'),
  hasDisallowedSighash: false,
  isPsbtMutable: false,
  psbtInputs: [],
  psbtOutputs: [],
  shouldDefaultToAdvancedView: false,
};

function renderHeader(context: PsbtSignerContext) {
  return renderToString(
    <PsbtSignerProvider value={context}>
      <PsbtRequestDetailsHeader />
    </PsbtSignerProvider>
  );
}

describe(PsbtRequestDetailsHeader.name, () => {
  test('shows a certain badge when the signature binds all outputs', () => {
    const html = renderHeader(baseContext);

    expect(html).toContain('Certain');
    expect(html).toContain('data-variant="default"');
  });

  test('shows an uncertain badge when the psbt is mutable', () => {
    const html = renderHeader({ ...baseContext, isPsbtMutable: true });

    expect(html).toContain('Uncertain');
    expect(html).toContain('data-variant="warning"');
  });

  test('shows a dangerous badge when a descriptor input has a disallowed sighash', () => {
    const html = renderHeader({ ...baseContext, hasDisallowedSighash: true });

    expect(html).toContain('Dangerous');
    expect(html).toContain('data-variant="error"');
  });

  test('prioritises the dangerous badge over the mutable warning', () => {
    const html = renderHeader({ ...baseContext, hasDisallowedSighash: true, isPsbtMutable: true });

    expect(html).toContain('Dangerous');
    expect(html).not.toContain('Uncertain');
  });
});
