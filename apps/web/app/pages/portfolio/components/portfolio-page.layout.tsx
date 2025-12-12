import { useState } from 'react';

import { Box, BoxProps, Stack, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { Money } from '@leather.io/models';

import { AllocationBar, AllocationSegment } from './allocation-bar';
import { AllPositionsSection } from './all-positions-section';
import { PortfolioTabs, TabId } from './portfolio-tabs';
import { mockAllocationSegments, mockYieldProtocols, YieldProtocol } from './yield-positions-data';

interface PortfolioPageLayoutProps extends BoxProps {
  overview?: React.ReactElement;
  assetList: React.ReactElement;
  activityList: React.ReactElement;
  visualization?: React.ReactElement;
  assetCount: number;
  dummyDataMode?: boolean;
  totalBalance?: Money;
  yieldPositionsValue?: Money;
  isConnected?: boolean;
}

export function PortfolioPageLayout({
  overview,
  assetList,
  activityList,
  visualization,
  assetCount,
  dummyDataMode,
  totalBalance,
  yieldPositionsValue,
  isConnected = false,
  ...props
}: PortfolioPageLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('yield-positions');

  const stackingCycleData = {
    daysUntilNextCycle: 4,
    totalStxStacked: '604.9M',
    totalValueStacked: '$224.5M',
  };

  const hasYieldPositions = isConnected;
  const allocationSegments: AllocationSegment[] = hasYieldPositions ? mockAllocationSegments : [];
  const protocols: YieldProtocol[] = hasYieldPositions ? mockYieldProtocols : [];

  return (
    <Page {...props}>
      <Page.Header title="Portfolio" />

      <Box
        filter={dummyDataMode ? 'blur(6px)' : 'blur(0px)'}
        transform={dummyDataMode ? 'scale(0.97)' : 'none'}
        pointerEvents={dummyDataMode ? 'none' : 'auto'}
        userSelect={dummyDataMode ? 'none' : 'unset'}
      >
        <Stack gap="space.05" mt="space.05">
          <PortfolioTabs
            tokenAllocationValue={totalBalance ?? null}
            tokenAllocationChange={0.15}
            yieldPositionsValue={yieldPositionsValue ?? totalBalance ?? null}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === 'token-allocation' && (
            <styled.div>
              <styled.h2 textStyle="heading.05" mt="space.05" mb="space.04">
                Overview
              </styled.h2>
              <styled.div borderTop="none">
                <Box borderRadius="sm" border="default" p="space.05">
                  {overview}
                  <Box mt="space.04" height="32px">
                    {visualization}
                  </Box>
                </Box>

                <Stack py="space.05" gap="space.05">
                  <Stack>
                    <styled.h2 textStyle="heading.05" mt="space.05" mb="space.02">
                      Tokens <styled.span color="ink.text-subdued">{assetCount}</styled.span>
                    </styled.h2>
                    {assetList}
                  </Stack>
                </Stack>
              </styled.div>
            </styled.div>
          )}

          {activeTab === 'yield-positions' && (
            <>
              <Box pt="space.03">
                <AllocationBar segments={allocationSegments} isEmpty={!hasYieldPositions} />
              </Box>
              <AllPositionsSection
                isEmpty={!hasYieldPositions}
                protocols={protocols}
                stackingCycleData={stackingCycleData}
              />
            </>
          )}
        </Stack>
      </Box>
    </Page>
  );
}
