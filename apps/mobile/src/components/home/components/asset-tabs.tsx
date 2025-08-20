import { t } from '@lingui/core/macro';

import { Box } from '@leather.io/ui/native';
import { match } from '@leather.io/utils';

import { ListTab, TAB_WIDTH } from '../constants';
import { TabButton } from './tab-button';

interface AssetTabsProps {
  listTab: ListTab;
  setListTab(listTab: ListTab): void;
}

export function AssetTabs({ listTab, setListTab }: AssetTabsProps) {
  const listTabMatcher = match<ListTab>();
  const tabIndex = listTabMatcher(listTab, {
    tokens: 0,
    collectibles: 1,
  });
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
          title={t`NFTs`}
          onPress={() => {
            setListTab('collectibles');
          }}
        />
      </Box>
      <Box>
        {/* TODO: height={2} */}
        <Box height={1} flex={1} bg="ink.border-default" />
        <Box
          left={tabIndex * TAB_WIDTH}
          position="absolute"
          height={1}
          width={TAB_WIDTH}
          bg="ink.text-primary"
        />
      </Box>
    </Box>
  );
}
