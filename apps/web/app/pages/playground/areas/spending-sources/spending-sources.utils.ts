import { formatCurrency } from '~/utils/currency-formatter';

import { createMarketData, createMarketPair } from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoney, truncateMiddle } from '@leather.io/utils';

import type { AddressTypeId, AddressTypeSource } from './spending-sources-mock-data';

const feeRateSatsPerVbyte = 5;
const txOverheadVbytes = 11;
const p2wpkhOutputVbytes = 31;
// Recipient plus change
const outputCount = 2;
const btcUsdPriceCents = 10_950_000;
const truncatedAddressChars = 4;

const btcUsdMarketData = createMarketData(
  createMarketPair('BTC', 'USD'),
  createMoney(btcUsdPriceCents, 'USD')
);

export const feeRateLabel = `${feeRateSatsPerVbyte} sats/vB`;

interface CandidateCoin {
  source: AddressTypeSource;
  sats: number;
}

export interface SpentFromType {
  id: AddressTypeId;
  label: string;
  address: string;
  mayHoldCollectibles: boolean;
  sats: number;
}

export interface SpendPlan {
  isCovered: boolean;
  feeSats: number;
  selectedSats: number;
  spentByType: SpentFromType[];
}

function sumSats(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function estimateFeeSats(coins: CandidateCoin[]) {
  const inputVbytes = sumSats(coins.map(coin => coin.source.inputVbytes));
  const txVbytes = txOverheadVbytes + inputVbytes + outputCount * p2wpkhOutputVbytes;
  return Math.ceil(txVbytes * feeRateSatsPerVbyte);
}

export function getAvailableSats(source: AddressTypeSource) {
  return sumSats(source.coins);
}

export function getAccountBalanceSats(sources: AddressTypeSource[]) {
  return sumSats(sources.map(getAvailableSats));
}

interface PlanSpendArgs {
  sources: AddressTypeSource[];
  allowed: AddressTypeId[];
  amountSats: number;
}

// Mirrors the wallet's determineUtxosForSpend: every allowed coin in one pool,
// largest first, taken until the inputs cover the amount plus the fee they
// themselves add. Simplified: no uneconomical-coin filter, no dust threshold
// on change.
export function planSpend({ sources, allowed, amountSats }: PlanSpendArgs): SpendPlan {
  const pool: CandidateCoin[] = sources
    .filter(source => allowed.includes(source.id))
    .flatMap(source => source.coins.map(sats => ({ source, sats })))
    .sort((a, b) => b.sats - a.sats);

  const picked: CandidateCoin[] = [];
  for (const coin of pool) {
    picked.push(coin);
    const pickedSats = sumSats(picked.map(candidate => candidate.sats));
    if (pickedSats >= amountSats + estimateFeeSats(picked)) break;
  }

  const feeSats = estimateFeeSats(picked);
  const selectedSats = sumSats(picked.map(coin => coin.sats));

  const spentByType = sources
    .map(source => ({
      id: source.id,
      label: source.label,
      address: source.address,
      mayHoldCollectibles: source.mayHoldCollectibles,
      sats: sumSats(picked.filter(coin => coin.source.id === source.id).map(coin => coin.sats)),
    }))
    .filter(spent => spent.sats > 0);

  return {
    isCovered: selectedSats >= amountSats + feeSats,
    feeSats,
    selectedSats,
    spentByType,
  };
}

export function formatBtc(sats: number) {
  return formatCurrency(createMoney(sats, 'BTC'), { preset: 'pad-decimals' });
}

export function formatUsd(sats: number) {
  return formatCurrency(baseCurrencyAmountInQuote(createMoney(sats, 'BTC'), btcUsdMarketData));
}

export function truncateAddress(address: string) {
  return truncateMiddle(address, truncatedAddressChars);
}

export function formatCoinCount(count: number) {
  if (count === 1) return '1 coin';
  return `${count} coins`;
}

interface IsRequiredToCoverArgs extends PlanSpendArgs {
  id: AddressTypeId;
}

// A type the transfer cannot do without: switching it off would leave the
// remaining allowed types unable to cover amount plus fee. Only a type that
// is currently allowed can be required; turning one on only adds funds.
export function isRequiredToCover({ id, sources, allowed, amountSats }: IsRequiredToCoverArgs) {
  if (!allowed.includes(id)) return false;
  const withoutType = allowed.filter(type => type !== id);
  return !planSpend({ sources, allowed: withoutType, amountSats }).isCovered;
}

type DefaultAllowedArgs = Omit<PlanSpendArgs, 'allowed'>;

// What Leather picks before the user touches anything: types that may hold
// collectibles stay out whenever the other types cover the transfer, and only
// come in when they are needed.
export function getDefaultAllowed({ sources, amountSats }: DefaultAllowedArgs) {
  const safeTypes = sources.filter(source => !source.mayHoldCollectibles).map(source => source.id);
  if (planSpend({ sources, allowed: safeTypes, amountSats }).isCovered) return safeTypes;
  return sources.map(source => source.id);
}

export function findRequiredCollectibleSource({ sources, allowed, amountSats }: PlanSpendArgs) {
  return sources.find(
    source =>
      source.mayHoldCollectibles &&
      isRequiredToCover({ id: source.id, sources, allowed, amountSats })
  );
}

export function describeCollectibleShortfall(
  source: AddressTypeSource,
  sources: AddressTypeSource[]
) {
  const otherLabels = sources
    .filter(other => other.id !== source.id)
    .map(other => other.label)
    .join(' and ');
  return {
    title: `${source.label} coins are needed`,
    body: `${otherLabels} alone cannot cover this transfer. To keep your ${source.label} coins untouched, go back to the app and use a smaller amount.`,
  };
}
