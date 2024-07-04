import { useState } from 'react';

import { BrowserEmptyState } from '@/components/browser/browser-empty-state';
import { BrowerInUse } from '@/components/browser/browser-in-use';
import { BrowserType } from '@/components/browser/utils';

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
        <BrowerInUse
          textURL={textURL}
          goToInactiveBrowser={() => setBrowserType(BrowserType.inactive)}
        />
      );
  }
}
