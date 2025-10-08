import { Linking } from 'react-native';

import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { t } from '@lingui/core/macro';

import { Pressable, Text } from '@leather.io/ui/native';
import { isObject, truncateMiddle } from '@leather.io/utils';

import { TokenDetailsCard } from '../components/token-details-card';

function replaceUnderscores(str: string) {
  return str.replace(/_/g, ' ');
}

function addPascalCaseSpaces(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function formatLabel(key: string): string {
  // Special case for locationUrl in collection context
  if (key === 'location_url') {
    return t`Collection URL`;
  }

  return addPascalCaseSpaces(replaceUnderscores(key)).replace(/^./, c => c.toUpperCase());
}

function renderValue(value: unknown, key: string): React.ReactNode {
  const stringValue = Array.isArray(value) ? JSON.stringify(value) : String(value);

  const keysToTruncate = ['address', 'id', 'assetId', 'contractId', 'txid'];
  if (keysToTruncate.includes(key)) {
    return truncateMiddle(stringValue, 4);
  }

  // Special handling for location_url - prepend gamma.io domain
  if (key === 'collectionExplorerUrl' && typeof stringValue === 'string') {
    const fullUrl = `https://gamma.io${stringValue}`;
    return (
      <Pressable onPress={() => Linking.openURL(fullUrl)}>
        {({ pressed }) => (
          <Text textDecorationLine="underline" opacity={pressed ? 0.5 : 1}>
            {t`View`}
          </Text>
        )}
      </Pressable>
    );
  }

  // If value is a URL, make it clickable
  if (typeof stringValue === 'string' && stringValue.startsWith('https://')) {
    return (
      <Pressable onPress={() => Linking.openURL(stringValue)}>
        {({ pressed }) => (
          <Text textDecorationLine="underline" opacity={pressed ? 0.5 : 1}>
            {t`View`}
          </Text>
        )}
      </Pressable>
    );
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
  title?: string,
  keyIndex?: number
): React.ReactNode[] {
  const items: React.ReactNode[] = [];
  const nestedCards: React.ReactNode[] = [];

  // Defined sort order for the collectible details
  const sortOrder = ['name', 'tokenId', 'assetId', 'contractId', 'mimetype', 'contentType'];
  getSortedEntries(obj, sortOrder)
    .map(([key, value]) => {
      // Skip undefined or empty string values
      if (value === undefined || value === '') return null;

      if (key === 'description') return null;
      // Filter out any keys that begin with 'genesis' (ordinals related keys)
      if (key.toLowerCase().startsWith('genesis')) return null;

      const label = formatLabel(key);

      // Handle arrays - used by attributes
      if (Array.isArray(value)) {
        // Skip empty arrays
        if (value.length === 0) return null;

        // Only process arrays of objects
        if (isObject(value[0])) {
          value.map((item, index) => {
            nestedCards.push(...renderCollectibleDetailsRecursively(item, label, index));
          });
          return null;
        }

        // For arrays of primitives, render as JSON string (existing behavior)
        return <SummaryTableItem key={key} label={label} value={renderValue(value, key)} />;
      } else if (isObject(value) && value !== null && !Array.isArray(value)) {
        // Collect nested cards to render after this card
        nestedCards.push(...renderCollectibleDetailsRecursively(value, label));
        return null;
      } else {
        // Collect primitive values as table items
        return <SummaryTableItem key={key} label={label} value={renderValue(value, key)} />;
      }
    })
    .filter(Boolean)
    .forEach(item => {
      if (item) items.push(item);
    });

  // Only render card if there are items to show
  if (items.length === 0 && nestedCards.length === 0) return [];

  const currentCard = (
    <TokenDetailsCard
      key={`${title || 'details'}-${keyIndex ? `-${keyIndex}` : ''}`}
      title={title || t`Details`}
    >
      <SummaryTableRoot>{items}</SummaryTableRoot>
    </TokenDetailsCard>
  );

  return [currentCard, ...nestedCards];
}
