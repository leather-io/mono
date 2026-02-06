import { Box, Flex } from 'leather-styles/jsx';

import { useSwapContext } from '@leather.io/state/swap';

import { RouteUrls } from '@shared/route-urls';

import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { AmountField } from '@app/pages/swap/components/amount-field';
import { AssetBalance } from '@app/pages/swap/components/asset-balance';
import { AssetSelectorToggle } from '@app/pages/swap/components/asset-selector-toggle';

export function SwapForm() {
  const { state, actions } = useSwapContext();

  return (
    <Box width="100%">
      <PageHeader title="Swap" onBackLocation={RouteUrls.Home} />
      <Content>
        <Page>
          <Card>
            <Flex justifyContent="space-between" alignItems="flex-start">
              <AmountField
                asset={state.baseSwapAsset?.asset}
                value={state.baseAmount}
                secondaryAmount={state.secondaryAmount}
                inputCurrencyMode={state.inputCurrencyMode}
              />

              <Flex direction="column" gap="space.03" alignItems="flex-end">
                <AssetSelectorToggle
                  asset={state.baseSwapAsset?.asset}
                  onPress={() => actions.openAssetSelector('base')}
                />
                <AssetBalance
                  balance={state.baseSwapAsset?.balance}
                  inputCurrencyMode={state.inputCurrencyMode}
                />
              </Flex>
            </Flex>
          </Card>
        </Page>
      </Content>
    </Box>
  );
}
