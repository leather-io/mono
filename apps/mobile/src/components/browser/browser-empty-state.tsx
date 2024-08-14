import { useState } from 'react';
import { TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, PlaceholderIcon, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { TabBar } from '../tab-bar';
import { formatURL } from './utils';

interface BrowserEmptyStateProps {
  textURL: string;
  setTextURL: (val: string) => void;
  goToActiveBrowser: () => void;
}

interface Shortcut {
  title: string;
  link: string;
  description?: string;
  favicon?: string;
}

function getCurrentArray(currentTab: CurrentTab) {
  const SUGGESTED: Shortcut[] = [
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
  ];

  const RECENT: Shortcut[] = [
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
  ];

  const CONNECTED: Shortcut[] = [
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title`, description: t`Description` },
    { link: 'https://gamma.io', title: t`Title` },
    { link: 'https://gamma.io', title: t`Title` },
  ];
  switch (currentTab) {
    case 'connected':
      return CONNECTED;
    case 'recent':
      return RECENT;
    case 'suggested':
      return SUGGESTED;
  }
}

type CurrentTab = 'suggested' | 'recent' | 'connected';

interface AppWidgetProps {
  onPress: () => void;
  shortcut: Shortcut;
}
function AppWidget({ onPress, shortcut }: AppWidgetProps) {
  return (
    <TouchableOpacity onPress={onPress} flexDirection="row" gap="3">
      <Box borderRadius="sm">
        <PlaceholderIcon height={60} width={60} />
      </Box>

      <Box justifyContent="center" gap="1">
        <Text variant="label02">{shortcut.title}</Text>
        {shortcut.description ? (
          <Text variant="label03" color="ink.text-subdued">
            {shortcut.description}
          </Text>
        ) : null}
      </Box>
    </TouchableOpacity>
  );
}

export function BrowserEmptyState({
  textURL,
  setTextURL,
  goToActiveBrowser,
}: BrowserEmptyStateProps) {
  const { top, bottom } = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<CurrentTab>('suggested');
  const theme = useTheme<Theme>();
  function redirect(url: string) {
    setTextURL(formatURL(url));
    goToActiveBrowser();
  }

  function submit() {
    redirect(textURL);
  }

  function resetTextInput() {
    setTextURL('');
  }

  return (
    <Box flex={1} backgroundColor="ink.background-primary" style={{ paddingTop: top }}>
      <Box px="4" py="2" flexDirection="row">
        <Box
          py="2"
          px="2"
          flexDirection="row"
          bg="ink.background-primary"
          borderRadius="sm"
          shadowColor="ink.background-secondary"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={5}
          borderColor="ink.border-transparent"
          borderWidth={1}
          flex={1}
        >
          <Box height={40} width={40} borderRadius="round" bg="yellow.border" />
          <TextInput
            keyboardType="web-search"
            textContentType="URL"
            autoCapitalize="none"
            onChangeText={setTextURL}
            value={textURL}
            autoComplete="url"
            onSubmitEditing={submit}
            style={{ paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }}
            placeholder={t`Type URL or search`}
          />
        </Box>
        {textURL ? (
          <TouchableOpacity p="3" mx="2" justifyContent="center" onPress={resetTextInput}>
            <Text variant="label02">{t`Cancel`}</Text>
          </TouchableOpacity>
        ) : null}
      </Box>
      <TabBar
        tabs={[
          {
            onPress() {
              setCurrentTab('suggested');
            },
            title: t`Suggested`,
            isActive: currentTab === 'suggested',
          },
          {
            onPress() {
              setCurrentTab('recent');
            },
            title: t`Recent`,
            isActive: currentTab === 'recent',
          },
          {
            onPress() {
              setCurrentTab('connected');
            },
            title: t`Connected`,
            isActive: currentTab === 'connected',
          },
        ]}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[3],
        }}
      >
        {getCurrentArray(currentTab).map((shortcut, idx) => (
          <AppWidget
            key={shortcut.link + idx}
            shortcut={shortcut}
            onPress={() => {
              setTextURL(shortcut.link);
              goToActiveBrowser();
            }}
          />
        ))}
      </ScrollView>
    </Box>
  );
}
