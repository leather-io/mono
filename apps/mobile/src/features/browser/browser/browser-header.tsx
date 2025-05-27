import { Box, ClockIcon, ConnectionIcon, SparkleIcon } from '@leather.io/ui/native';

import { useDappSuggestions } from '../../feature-flags';
import { Tab } from './tab';
import { BrowserSheetTab } from './utils';

interface BrowserHeaderProps {
  currentTab: BrowserSheetTab;
  setCurrentTab: (currentTab: BrowserSheetTab) => void;
}

export function BrowserHeader({ currentTab, setCurrentTab }: BrowserHeaderProps) {
  const dappSuggestions = useDappSuggestions();
  return (
    <Box flexDirection="row" height={74}>
      {dappSuggestions && (
        <Tab
          isActive={currentTab === 'suggested'}
          onPress={() => {
            setCurrentTab('suggested');
          }}
        >
          <SparkleIcon />
        </Tab>
      )}
      <Tab
        isActive={currentTab === 'connected'}
        onPress={() => {
          setCurrentTab('connected');
        }}
      >
        <ConnectionIcon />
      </Tab>
      <Tab
        isActive={currentTab === 'recent'}
        onPress={() => {
          setCurrentTab('recent');
        }}
      >
        <ClockIcon />
      </Tab>
    </Box>
  );
}
