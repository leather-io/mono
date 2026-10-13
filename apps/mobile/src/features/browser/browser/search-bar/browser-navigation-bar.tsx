import { Box, ChevronLeftIcon, Pressable, Text } from '@leather.io/ui/native';

interface BrowserNavigationBarProps {
  searchUrl: string;
  onGoBack(): void;
  canGoBack: boolean;
  onPressUrl(): void;
}
export function BrowserNavigationBar({
  searchUrl,
  onGoBack,
  canGoBack,
  onPressUrl,
}: BrowserNavigationBarProps) {
  const hostname = new URL(searchUrl).hostname;
  return (
    <Box
      bg="ink.background-primary"
      justifyContent="flex-start"
      alignItems="center"
      flexDirection="row"
      paddingBottom="3"
      paddingTop="2"
    >
      <Pressable p="4" onPress={onGoBack} disabled={!canGoBack}>
        <ChevronLeftIcon variant="small" />
      </Pressable>
      <Pressable
        bg="ink.component-background-non-interactive"
        justifyContent="center"
        alignItems="center"
        flex={1}
        borderColor="ink.border-default"
        borderWidth={1}
        borderRadius="sm"
        p="2"
        onPress={onPressUrl}
      >
        <Text variant="caption01">{hostname}</Text>
      </Pressable>
      <Box m="4" width={16} height={16} />
    </Box>
  );
}
