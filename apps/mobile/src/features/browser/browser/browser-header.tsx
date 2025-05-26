import { Box, ClockIcon, ConnectionIcon } from '@leather.io/ui/native';

import { Tab } from './tab';
import { BrowserSheetTab } from './utils';

interface BrowserHeaderProps {
  currentTab: BrowserSheetTab;
  setCurrentTab: (currentTab: BrowserSheetTab) => void;
}

export function BrowserHeader({ currentTab, setCurrentTab }: BrowserHeaderProps) {
  return (
    <Box flexDirection="row" height={74}>
      {/* <Tab */}
      {/*   isActive={currentTab === 'suggested'} */}
      {/*   onPress={() => { */}
      {/*     setCurrentTab('suggested'); */}
      {/*   }} */}
      {/* > */}
      {/*   <SparkleIcon /> */}
      {/* </Tab> */}
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
