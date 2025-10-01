import { SummaryTableItem, SummaryTableRoot } from '@/components/summary-table';
import { useOpenURL } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';

import { Pressable, Text } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

import { TokenDetailsCard } from '../components/token-details-card';

function formatLabel(key: string): string {
  // Special case for locationUrl in collection context
  if (key === 'location_url') {
    return 'Collection URL';
  }

  // Replace underscores with spaces
  let formatted = key.replace(/_/g, ' ');

  // Add spaces between PascalCase words
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Helper function to render value
function renderValue(value: any, key: string): React.ReactNode {
  const { openURL } = useOpenURL();
  const stringValue = Array.isArray(value) ? JSON.stringify(value) : String(value);

  const keysToTruncate = ['address', 'id', 'assetId', 'contractId', 'txid'];
  // Truncate if key is in keysToTruncate
  if (keysToTruncate.includes(key)) {
    return truncateMiddle(stringValue, 4);
  }

  // Special handling for location_url - prepend gamma.io domain
  if (key === 'location_url' && typeof stringValue === 'string') {
    const fullUrl = `https://gamma.io${stringValue}`;
    return (
      <Pressable onPress={() => openURL(fullUrl)}>
        {({ pressed }) => (
          <Text textDecorationLine="underline" opacity={pressed ? 0.5 : 1}>
            {t`View`}
          </Text>
        )}
      </Pressable>
    );
  }

  // Check if value is a URL
  if (typeof stringValue === 'string' && stringValue.startsWith('https://')) {
    return (
      <Pressable onPress={() => openURL(stringValue)}>
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
  title?: string
): React.ReactNode[] {
  const items: React.ReactNode[] = [];
  const nestedCards: React.ReactNode[] = [];

  // Defined sort order for the collectible details
  const sortOrder = ['name', 'tokenId', 'assetId', 'contractId', 'mimetype', 'contentType'];
  getSortedEntries(obj, sortOrder).forEach(([key, value]) => {
    // Skip undefined or empty string values
    if (value === undefined || value === '') return;

    // Skip description key as its shown elsewhere
    if (key.toLowerCase() === 'description') return;
    // Filter out any keys that begin with 'genesis' (ordinals related keys)
    if (key.toLowerCase().startsWith('genesis')) return;

    const label = formatLabel(key);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Collect nested cards to render after this card
      nestedCards.push(...renderCollectibleDetailsRecursively(value, label));
    } else {
      // Collect primitive values as table items
      items.push(<SummaryTableItem key={key} label={label} value={renderValue(value, key)} />);
    }
  });

  // Only render card if there are items to show
  if (items.length === 0 && nestedCards.length === 0) return [];

  // Create the current card with its items
  const currentCard = (
    <TokenDetailsCard key={title || 'details'} title={title || t`Details`}>
      <SummaryTableRoot>{items}</SummaryTableRoot>
    </TokenDetailsCard>
  );

  // Return current card followed by all nested cards
  return [currentCard, ...nestedCards];
}
