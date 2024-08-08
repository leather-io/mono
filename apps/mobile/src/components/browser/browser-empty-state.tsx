import { useState } from 'react';
import { TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NoFavicon from '@/assets/no-favicon.svg';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { TabBar } from '../tab-bar';
import { TransText } from '../trans-text';
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

const SUGGESTED: Shortcut[] = [
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
];

const RECENT: Shortcut[] = [
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
];

const CONNECTED: Shortcut[] = [
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title', description: 'Description' },
  { link: 'https://gamma.io', title: 'Title' },
  { link: 'https://gamma.io', title: 'Title' },
];

type CurrentTab = 'suggested' | 'recent' | 'connected';

function AppWidget({ onPress, shortcut }: { shortcut: Shortcut; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} flexDirection="row" gap="3">
      <Box borderRadius="sm">
        <NoFavicon height={60} width={60} />
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

  function getCurrentArray() {
    switch (currentTab) {
      case 'connected':
        return CONNECTED;
      case 'recent':
        return RECENT;
      case 'suggested':
        return SUGGESTED;
    }
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
            <TransText variant="label02">Cancel </TransText>
          </TouchableOpacity>
        ) : null}
      </Box>
      <TabBar
        tabs={[
          {
            onPress() {
              setCurrentTab('suggested');
            },
            title: 'Suggested',
            isActive: currentTab === 'suggested',
          },
          {
            onPress() {
              setCurrentTab('recent');
            },
            title: 'Recent',
            isActive: currentTab === 'recent',
          },
          {
            onPress() {
              setCurrentTab('connected');
            },
            title: 'Connected',
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
        {getCurrentArray().map((shortcut, idx) => (
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
