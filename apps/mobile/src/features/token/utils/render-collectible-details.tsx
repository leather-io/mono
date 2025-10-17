import { Linking } from 'react-native';

import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { getChainDisplayLabel } from '@/shared/display-preference';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { ArrowTopRightIcon, Box, Pressable, Text } from '@leather.io/ui/native';
import { createMoney, isObject, truncateMiddle } from '@leather.io/utils';

import { TokenDetailsCard } from '../components/token-details-card';

function replaceUnderscores(str: string) {
  return str.replace(/_/g, ' ');
}

function addPascalCaseSpaces(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function renderLink(url: string, label: string) {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      {({ pressed }) => (
        <Box flexDirection="row" alignItems="center" gap="1">
          <Text
            variant="label02"
            textDecorationLine="underline"
            textDecorationColor="ink.text-subdued"
            opacity={pressed ? 0.5 : 1}
          >
            {label}
          </Text>
          <ArrowTopRightIcon color="ink.text-subdued" variant="small" />
        </Box>
      )}
    </Pressable>
  );
}

function formatLabel(key: string): string {
  if (key === 'chain') {
    return t`Layer`;
  }

  if (key === 'contractId') {
    return t`Contract Details`;
  }

  if (key === 'location_url') {
    return t`Collection URL`;
  }

  return addPascalCaseSpaces(replaceUnderscores(key)).replace(/^./, c => c.toUpperCase());
}

function renderValue(value: unknown, key: string, chainName?: string): React.ReactNode {
  const stringValue = Array.isArray(value) ? JSON.stringify(value) : String(value);

  if (key === 'chain') {
    const chain = stringValue as 'bitcoin' | 'stacks';
    return getChainDisplayLabel(chain);
  }

  if (key === 'protocol') {
    if (stringValue === 'sip9') return 'SIP9';
    if (stringValue === 'inscription') return t`Inscription`;
    return stringValue;
  }

  if (key === 'floorPrice') {
    if (isObject(value) && 'amount' in value && typeof value.amount === 'number') {
      const money = createMoney(value.amount, 'STX');
      return formatCurrency(money);
    }
    if (typeof value === 'number') {
      const money = createMoney(value, 'STX');
      return formatCurrency(money);
    }
  }

  const keysToTruncate = ['address', 'id','txid'];
  if (keysToTruncate.includes(key)) {
    return truncateMiddle(stringValue, 4);
  }

  // Special handling for contractId - link to contract explorer
  if (key === 'contractId' && typeof stringValue === 'string' && chainName) {
    const fullUrl = `https://explorer.hiro.so/address/${stringValue}?chain=${chainName}`;
    return renderLink(fullUrl, truncateMiddle(stringValue, 2));
  }


  // If value is a URL, make it clickable
  if (typeof stringValue === 'string' && stringValue.startsWith('https://')) {
    return renderLink(stringValue, t`View`);
  }

  return stringValue;
}

function getSortedEntries(obj: Record<string, any>, sortOrder: string[]) {
  return Object.entries(obj).sort(([keyA], [keyB]) => {
    const indexA = sortOrder.indexOf(keyA);
    const indexB = sortOrder.indexOf(keyB);

    // If both are in sortOrder, sort by their position
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only A is in sortOrder, A comes first
    if (indexA !== -1) return -1;
    // If only B is in sortOrder, B comes first
    if (indexB !== -1) return 1;
    // Otherwise maintain original order
    return 0;
  });
}

export function renderCollectibleDetailsRecursively(
  obj: Record<string, any>,
  chainName?: string
): React.ReactNode[] {
  const items: React.ReactNode[] = [];
  const attributeItems: React.ReactNode[] = [];

  const sortOrder = [
    'name',
    'tokenId',
    'contractId',
    'creator',
    'floorPrice',
    'chain',
    'protocol',
    'mimetype',
    'contentType',
  ];

  function processEntry(key: string, value: unknown, labelPrefix = '') {
    if (value === undefined || value === '') return null;
    if (key === 'description' || key === 'assetId' || key === 'category') return null;
    if (key.toLowerCase().startsWith('genesis')) return null;

    const label = labelPrefix + formatLabel(key);
    return (
      <SummaryTableItem
        key={`${labelPrefix}${key}`}
        label={label}
        value={renderValue(value, key, chainName)}
      />
    );
  }

  getSortedEntries(obj, sortOrder).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    if (key === 'description' || key === 'assetId' || key === 'category') return;
    if (key.toLowerCase().startsWith('genesis')) return;

    if (key === 'collection' && isObject(value) && !Array.isArray(value)) {
      const collectionRecord = value as Record<string, any>;
      const collectionExplorerUrl = collectionRecord.collectionExplorerUrl as string | undefined;

      Object.entries(value).forEach(([collectionKey, collectionValue]) => {
        if (collectionKey === 'collectionExplorerUrl') return;

        if (collectionKey === 'name') {
          const label = t`Collection Name`;
          const value = collectionExplorerUrl
            ? renderLink(`https://gamma.io${collectionExplorerUrl}`, String(collectionValue))
            : String(collectionValue);

          items.push(
            <SummaryTableItem key="collection-name" label={label} value={value} />
          );
          return;
        }

        const shouldPrependCollection = !collectionKey.toLowerCase().includes('collection');
        const prefix = shouldPrependCollection ? t`Collection ` : '';
        const item = processEntry(collectionKey, collectionValue, prefix);
        if (item) items.push(item);
      });
      return;
    }

    if (key === 'attributes' && Array.isArray(value)) {
      value.forEach((attr, index) => {
        if (!isObject(attr)) return;

        const attributeRecord = attr as Record<string, any>;
        const traitType = attributeRecord.traitType || attributeRecord.trait_type || '';
        const attrValue = attributeRecord.value || '';
        const rarityPercent = attributeRecord.rarityPercent || attributeRecord.rarity_percent;

        if (attrValue === 'None') return;

        const formattedValue = rarityPercent
          ? `${attrValue} (${rarityPercent}%)`
          : String(attrValue);

        attributeItems.push(
          <SummaryTableItem
            key={`attribute-${index}`}
            label={traitType}
            value={formattedValue}
          />
        );
      });
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      const item = processEntry(key, value);
      if (item) items.push(item);
      return;
    }

    if (isObject(value) && value !== null && !Array.isArray(value)) {
      return;
    }

    const item = processEntry(key, value);
    if (item) items.push(item);
  });

  const cards: React.ReactNode[] = [];

  if (items.length > 0) {
    cards.push(
      <TokenDetailsCard key="details" title={t`Details`}>
        <SummaryTableRoot>{items}</SummaryTableRoot>
      </TokenDetailsCard>
    );
  }

  if (attributeItems.length > 0) {
    cards.push(
      <TokenDetailsCard key="attributes" title={t`Attributes`}>
        <SummaryTableRoot>{attributeItems}</SummaryTableRoot>
      </TokenDetailsCard>
    );
  }

  return cards;
}
