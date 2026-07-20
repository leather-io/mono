import { Flex, styled } from 'leather-styles/jsx';

import { VariantSwitcher, useActiveVariant } from '../../components/variant-switcher';
import { BoardSection } from './board-section';

const btcVariants = [
  { id: 'current', label: 'Current (trimmed)' },
  { id: 'padded', label: 'Padded 8 decimals' },
  { id: 'sats', label: 'Sats' },
];

const stxVariants = [
  { id: 'current', label: 'Current (trimmed)' },
  { id: 'padded', label: 'Padded 6 decimals' },
];

const btcSamples = [0.5, 0.00042, 1.23456789, 2, 0.1];
const stxSamples = [1250.5, 0.000001, 42, 12345.123456];

function formatBtc(amount: number, variant: string) {
  if (variant === 'padded') return `${amount.toFixed(8)} BTC`;
  if (variant === 'sats') return `${Math.round(amount * 1e8).toLocaleString('en-US')} sats`;
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC`;
}

function formatStx(amount: number, variant: string) {
  if (variant === 'padded') return `${amount.toFixed(6)} STX`;
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} STX`;
}

function ValueColumn({ title, values }: { title: string; values: string[] }) {
  return (
    <Flex direction="column" gap="space.02" minWidth="220px">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {title}
      </styled.span>
      {values.map(value => (
        <styled.span
          key={value}
          textStyle="label.02"
          color="ink.text-primary"
          fontVariantNumeric="tabular-nums"
          textAlign="right"
        >
          {value}
        </styled.span>
      ))}
    </Flex>
  );
}

// Issue ask: always show 8 decimals with padded zeros wherever a BTC balance
// is displayed (unless shown in sats), and define the equivalent convention
// for STX. Padding makes columns of values scannable — decimal points align.
export function ValuesBoard() {
  const btcActive = useActiveVariant(btcVariants, 'btc');
  const stxActive = useActiveVariant(stxVariants, 'stx');

  return (
    <BoardSection
      title="BTC / STX value formatting"
      description="Compare trimmed vs zero-padded decimals on realistic balances. Padded columns align at the decimal point."
    >
      <Flex gap="space.08" flexWrap="wrap">
        <Flex direction="column" gap="space.03">
          <VariantSwitcher variants={btcVariants} param="btc" />
          <ValueColumn
            title={`BTC — ${btcActive.label}`}
            values={btcSamples.map(amount => formatBtc(amount, btcActive.id))}
          />
        </Flex>
        <Flex direction="column" gap="space.03">
          <VariantSwitcher variants={stxVariants} param="stx" />
          <ValueColumn
            title={`STX — ${stxActive.label}`}
            values={stxSamples.map(amount => formatStx(amount, stxActive.id))}
          />
        </Flex>
      </Flex>
    </BoardSection>
  );
}
