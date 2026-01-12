import { useEffect, useState } from 'react';

import { Circle, styled } from 'leather-styles/jsx';
import {
  SHOW_MOCK_MODE_TOGGLE,
  getLeatherMockMode,
  setLocalStorageMockMode,
} from '~/constants/environment';

import { Flag } from '@leather.io/ui';
import { delay } from '@leather.io/utils';

import { BasicHoverCard } from './basic-hover-card';
import { WhenClient } from './when-client';

export function MockModeToggle() {
  const [isMockMode, setIsMockMode] = useState(getLeatherMockMode());

  useEffect(() => {
    setIsMockMode(getLeatherMockMode());
  }, []);

  async function handleToggle() {
    const newMockMode = !isMockMode;
    setIsMockMode(newMockMode);
    setLocalStorageMockMode(newMockMode);
    const { worker } = await import('~/mocks/api/browser');
    if (newMockMode) {
      await worker.start();
    } else {
      worker.stop();
    }
    await delay(200);
    window.location.reload();
  }

  if (!SHOW_MOCK_MODE_TOGGLE) return null;

  return (
    <WhenClient>
      <styled.div position="fixed" bottom="16px" right="16px" zIndex={100}>
        <BasicHoverCard content="Mock mode uses MSW to mock API calls, and adds a mock Leather provider to the page to simulate Leather functionality">
          <styled.button
            cursor="pointer"
            p="space.01"
            background="ink.background-secondary"
            border="default"
            borderRadius="md"
            onClick={handleToggle}
          >
            <Flag
              spacing="space.02"
              mr="space.04"
              textStyle="caption.01"
              img={
                <Circle
                  size="6px"
                  bgColor={isMockMode ? 'red.action-primary-default' : 'ink.border-default'}
                />
              }
            >
              Mock mode {isMockMode ? 'on' : 'off'}
            </Flag>
          </styled.button>
        </BasicHoverCard>
      </styled.div>
    </WhenClient>
  );
}
