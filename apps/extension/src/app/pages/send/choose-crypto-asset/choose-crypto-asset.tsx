import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Box, styled } from 'leather-styles/jsx';

import { Card, Content, Page } from '@app/components/layout';
import { TokenList } from '@app/features/asset-list/token-list';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useNavigateToSendForm } from '@app/pages/send/hooks/use-navigate-to-send-form';

export function ChooseCryptoAsset() {
  const navigateToSendForm = useNavigateToSendForm();

  return (
    <>
      <PageHeader isSettingsVisibleOnSm={false} />
      <Content>
        <Page>
          <Card
            dataTestId={SendCryptoAssetSelectors.ChooseAssetToSendPage}
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
