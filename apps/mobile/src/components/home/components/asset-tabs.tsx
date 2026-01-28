import { t } from '@lingui/core/macro';

import { Box } from '@leather.io/ui/native';

import { ListTab, TAB_WIDTH } from '../constants';
import { TabButton } from './tab-button';

interface AssetTabsProps {
  listTab: ListTab;
  setListTab(listTab: ListTab): void;
}

export function AssetTabs({ listTab, setListTab }: AssetTabsProps) {
  const tabIndex = {
    tokens: 0,
    collectibles: 1,
  }[listTab];
  return (
    <Box>
      <Box flexDirection="row">
        <TabButton
          isActive={listTab === 'tokens'}
          title={t`Tokens`}
          onPress={() => {
            setListTab('tokens');
          }}
        />
        <TabButton
          isActive={listTab === 'collectibles'}
          title={t`Collectibles`}
          onPress={() => {
            setListTab('collectibles');
          }}
        />
      </Box>
      <Box>
        <Box height={2} flex={1} bg="ink.border-default" />
        <Box
          left={tabIndex * TAB_WIDTH}
          position="absolute"
          height={2}
          width={TAB_WIDTH}
          bg="ink.text-primary"
        />
      </Box>
    </Box>
  );
}
