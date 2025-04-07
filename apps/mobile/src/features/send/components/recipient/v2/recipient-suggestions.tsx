import { AccountAvatar } from '@/features/accounts/components/account-avatar';
import {
  RecipientSuggestion,
  RecipientSuggestionSection,
} from '@/features/send/components/recipient/v2/types';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';

import { Box, Cell, PersonIcon, Text } from '@leather.io/ui/native';

interface RecipientSuggestionsProps {
  suggestions: RecipientSuggestionSection[];
}

export function RecipientSuggestions({ suggestions }: RecipientSuggestionsProps) {
  return (
    <BottomSheetSectionList
      keyExtractor={item => item.id}
      stickySectionHeadersEnabled={false}
      sections={suggestions}
      renderSectionHeader={({ section }) => (
        <Box px="5" mt="5" mb="2">
          <Text variant="label02">{section.title}</Text>
        </Box>
      )}
      renderItem={({ item }) => <RecipientSuggestionItem item={item} />}
    />
  );
}

interface RecipientSuggestionItemProps {
  item: RecipientSuggestion;
}

function RecipientSuggestionItem({ item }: RecipientSuggestionItemProps) {
  return (
    <Cell.Root pressable={true}>
      <Cell.Icon>
        <AccountAvatar icon={PersonIcon} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label
          numberOfLines={1}
          ellipsizeMode="middle"
          variant="primary"
          style={{ width: 140 }}
        >
          {item.title}
        </Cell.Label>
        <Cell.Label
          variant="secondary"
          numberOfLines={1}
          ellipsizeMode="middle"
          style={{ width: 140 }}
        >
          {item.subtitle}
        </Cell.Label>
      </Cell.Content>
    </Cell.Root>
  );
}
