import { Box, styled } from 'leather-styles/jsx';

import { assetIdToSendPath } from '@leather.io/features';
import { CryptoAssetProtocols } from '@leather.io/models';
import { type SerializedCryptoAssetId, deserializeAssetId } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { Card, Content, Page } from '@app/components/layout';
import { TokenList } from '@app/features/asset-list/token-list';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useConfigBitcoinSendEnabled } from '@app/query/common/remote-config/remote-config.query';
import { useNavigate } from '@app/routes/compat';

export function ChooseCryptoAsset() {
  const navigate = useNavigate();
  const isBitcoinSendEnabled = useConfigBitcoinSendEnabled();

  function navigateToSendForm(assetId: SerializedCryptoAssetId) {
    const { protocol } = deserializeAssetId(assetId);
    if (protocol === CryptoAssetProtocols.nativeBtc && !isBitcoinSendEnabled) {
      return navigate(RouteUrls.SendBtcDisabled);
    }
    return navigate(`${RouteUrls.SendCryptoAsset}/${assetIdToSendPath(assetId)}`);
  }

  return (
    <>
      <PageHeader isSettingsVisibleOnSm={false} />
      <Content>
        <Page>
          <Card
            contentStyle={{
              p: 'space.00',
            }}
            header={
              <styled.h1 textStyle="heading.03" p="space.05">
                choose asset <br /> to send
              </styled.h1>
            }
          >
            <Box pb="space.04" px="space.05">
              <TokenList
                onSelectAsset={navigateToSendForm}
                variant="interactive"
                filter="enabled"
              />
            </Box>
          </Card>
        </Page>
      </Content>
    </>
  );
}
