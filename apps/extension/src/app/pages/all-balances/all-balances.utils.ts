import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import type BigNumber from 'bignumber.js';
import { AddressType, getAddressInfo, validate } from 'bitcoin-address-validation';
import { entries, groupBy, keys, map, pipe, sortBy } from 'remeda';

import type { BtcBalance, Money, OwnedUtxo } from '@leather.io/models';
import type { UtxoTotals } from '@leather.io/services';
import { sumNumbers } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';

export function formatBalance(money?: Money) {
  return money ? formatCurrency(money) : emptyAmountPlaceholder;
}

export const tooltipTextMap = {
  totalBalance:
    'The total value of all your assets across Bitcoin and Stacks networks, including locked, pending, and spendable funds.',
  btcProtocol: 'The total value of all the Bitcoin you hold on the Bitcoin network.',
  btcAvailable:
    'The BTC you can send right now. This excludes pending deposits, funds already on their way to someone else, and amounts too small to be worth sending.',
  btcPending:
    'BTC on its way to you, from transactions that have been broadcast but haven’t been confirmed on the Bitcoin network yet.',
  btcSending:
    'Funds already on their way to someone else, locked in transactions that haven’t been confirmed on the Bitcoin network yet.',
  btcUneconomical:
    'Tiny amounts that cost more to send than they’re worth, so they can’t be spent.',
  stacksProtocol:
    'The total value of all your Stacks-based assets, including STX, SIP-10 tokens, and sBTC.',
  stxAvailable:
    'The STX you can send or use right now. This excludes any locked or pending amounts.',
  stxLocked:
    'STX that is currently committed to Stacking and cannot be transferred until the Stacking cycle ends.',
  stxPending:
    'STX from transactions that have been broadcast but haven’t been confirmed on the Stacks network yet.',
  sip10:
    'The total value of SIP-10 tokens in your wallet, excluding sBTC. SIP-10 is the fungible token standard on Stacks.',
  sbtc: 'The sBTC you hold on the Stacks network. sBTC is a Bitcoin-backed asset issued as a SIP-10 token.',
};

interface BtcBalanceCategoryConfig {
  balanceKey: keyof Pick<
    BtcBalance,
    'availableBalance' | 'inboundBalance' | 'outboundBalance' | 'dustBalance'
  >;
  utxoKey: keyof Pick<UtxoTotals, 'available' | 'inbound' | 'outbound' | 'dust'>;
  title: string;
  tooltipText: string;
  dataTestId: AllBalancesSelectors;
}

export const btcBalanceCategoryMap = {
  available: {
    balanceKey: 'availableBalance',
    utxoKey: 'available',
    title: 'Available to transfer',
    tooltipText: tooltipTextMap.btcAvailable,
    dataTestId: AllBalancesSelectors.BalanceRowAvailable,
  },
  pending: {
    balanceKey: 'inboundBalance',
    utxoKey: 'inbound',
    title: 'Pending',
    tooltipText: tooltipTextMap.btcPending,
    dataTestId: AllBalancesSelectors.BalanceRowPending,
  },
  sending: {
    balanceKey: 'outboundBalance',
    utxoKey: 'outbound',
    title: 'Sending',
    tooltipText: tooltipTextMap.btcSending,
    dataTestId: AllBalancesSelectors.BalanceRowSending,
  },
  uneconomical: {
    balanceKey: 'dustBalance',
    utxoKey: 'dust',
    title: 'Uneconomical',
    tooltipText: tooltipTextMap.btcUneconomical,
    dataTestId: AllBalancesSelectors.BalanceRowUneconomical,
  },
} satisfies Record<string, BtcBalanceCategoryConfig>;

export type BtcBalanceCategory = keyof typeof btcBalanceCategoryMap;

export const btcBalanceCategories = keys(btcBalanceCategoryMap);

export function isBtcBalanceCategory(value?: string): value is BtcBalanceCategory {
  return btcBalanceCategories.some(category => category === value);
}

const nativeSegwitLabel = 'Native Segwit';
const taprootLabel = 'Taproot';

const derivationPathLabelMap: Record<string, string> = {
  "m/84'": nativeSegwitLabel,
  "m/86'": taprootLabel,
};

const addressTypeLabelMap: Record<AddressType, string> = {
  [AddressType.p2wpkh]: nativeSegwitLabel,
  [AddressType.p2tr]: taprootLabel,
  [AddressType.p2sh]: 'Nested Segwit',
  [AddressType.p2wsh]: 'Native Segwit script',
  [AddressType.p2pkh]: 'Legacy',
};

function getAddressTypeLabel(utxo: OwnedUtxo): string | undefined {
  const derivationPathLabel = entries(derivationPathLabelMap).find(([prefix]) =>
    utxo.path.startsWith(prefix)
  )?.[1];
  if (derivationPathLabel) return derivationPathLabel;
  if (!validate(utxo.address)) return undefined;
  return addressTypeLabelMap[getAddressInfo(utxo.address).type];
}

interface AddressUtxoGroup {
  address: string;
  addressTypeLabel?: string;
  totalSats: BigNumber;
  utxos: OwnedUtxo[];
}

export function groupUtxosByAddress(utxos: OwnedUtxo[]): AddressUtxoGroup[] {
  return pipe(
    utxos,
    groupBy(utxo => utxo.address),
    entries(),
    map(([address, group]): AddressUtxoGroup => {
      const groupUtxos = group ?? [];
      return {
        address,
        addressTypeLabel: groupUtxos[0] ? getAddressTypeLabel(groupUtxos[0]) : undefined,
        totalSats: sumUtxoSats(groupUtxos),
        utxos: groupUtxos,
      };
    }),
    sortBy([group => group.totalSats.toNumber(), 'desc'])
  );
}

export function sumUtxoSats(utxos: OwnedUtxo[]): BigNumber {
  return sumNumbers(utxos.map(utxo => utxo.value));
}
