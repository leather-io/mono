import { useState } from 'react';

import { useDappSuggestions } from '@/features/feature-flags';

import { Box } from '@leather.io/ui/native';

import { BrowserHeader } from './browser-header';
import { BrowserConnectedTab } from './tabs/browser-connected-tab';
import { BrowserRecentTab } from './tabs/browser-recent-tab';
import { BrowserSuggestedTab } from './tabs/browser-suggested-tab';
import { BrowserSheetTab } from './utils';

interface BrowserInactiveStateProps {
  goToUrl(url: string): void;
}
export function BrowserInactiveState({ goToUrl }: BrowserInactiveStateProps) {
  const dappSuggestions = useDappSuggestions();

  const [currentTab, setCurrentTab] = useState<BrowserSheetTab>(
    dappSuggestions ? 'suggested' : 'connected'
  );

  return (
    <Box flex={1} bg="ink.background-primary">
      <BrowserHeader currentTab={currentTab} setCurrentTab={setCurrentTab} />
      {currentTab === 'suggested' && <BrowserSuggestedTab goToUrl={goToUrl} />}
      {currentTab === 'connected' && <BrowserConnectedTab goToUrl={goToUrl} />}
      {currentTab === 'recent' && <BrowserRecentTab goToUrl={goToUrl} />}
    </Box>
  );
}
