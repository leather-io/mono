import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';

import { Theme } from '@leather.io/ui/native';

interface RecipientPasteButtonProps {
  onPress: (value: string) => void;
}

// Only implement a dedicated paste button for iOS. Android already provides a great out-of-the-box pasting interface.
export function IosRecipientPasteButton({ onPress }: RecipientPasteButtonProps) {
  const theme = useTheme<Theme>();

  function handlePress(payload: Clipboard.PasteEventPayload) {
    if (payload.type === 'text') {
      onPress(payload.text);
    }
  }

  return (
    <Clipboard.ClipboardPasteButton
      acceptedContentTypes={['plain-text']}
      displayMode="iconOnly"
      onPress={handlePress}
      foregroundColor={theme.colors['ink.action-primary-default']}
      backgroundColor={theme.colors['ink.background-primary']}
      cornerStyle="small"
      style={{
        top: 2,
        width: 36,
        height: 36,
        transform: [{ scale: 1.12 }],
      }}
    />
  );
}
