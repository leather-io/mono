import { useState } from 'react';

import { BrowserEmptyState } from '@/components/browser/browser-empty-state';
import { BrowserInUse } from '@/components/browser/browser-in-use';
import { BrowserType } from '@/components/browser/utils';

import { assertUnreachable } from '@leather.io/utils';

export default function BrowserScreen() {
  const [textURL, setTextURL] = useState('');
  const [browserType, setBrowserType] = useState(BrowserType.inactive);

  switch (browserType) {
    case BrowserType.inactive:
      return (
        <BrowserEmptyState
          textURL={textURL}
          setTextURL={setTextURL}
          goToActiveBrowser={() => setBrowserType(BrowserType.active)}
        />
      );

    case BrowserType.active:
      return (
        <BrowserInUse
          textURL={textURL}
          goToInactiveBrowser={() => {
            setBrowserType(BrowserType.inactive);
            setTextURL('');
          }}
        />
      );
    default:
      assertUnreachable(browserType);
  }
}
