import { Navigate, useNavigate } from 'react-router';

import { Stack } from 'leather-styles/jsx';
import { z } from 'zod';

import { Button } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { useRouteState } from '@app/common/hooks/use-route-state';
import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import {
  InfoCardAssetValue,
  InfoCardRow,
  InfoCardSeparator,
} from '@app/components/info-card/info-card';
import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';

import { TxDone } from '../send-crypto-asset-form/components/tx-done';

const proposalSentSummaryStateSchema = z.object({
  symbol: z.string(),
  txValue: z.string(),
  txFiatValue: z.string().optional(),
  txFiatValueSymbol: z.string().optional(),
  recipient: z.string(),
  feeRowValue: z.string().optional(),
  memoDisplayText: z.string().optional(),
  proposalId: z.string().optional(),
});

export type ProposalSentSummaryState = z.infer<typeof proposalSentSummaryStateSchema>;

export function ProposalSentSummary() {
  const state = useRouteState(proposalSentSummaryStateSchema.nullish());
  const navigate = useNavigate();

  if (!state) return <Navigate to={RouteUrls.Home} replace />;

  const {
    symbol,
    txValue,
    txFiatValue,
    txFiatValueSymbol,
    recipient,
    feeRowValue,
    memoDisplayText,
    proposalId,
  } = state;

  return (
    <>
      <PageHeader title="Proposal submitted" isSummaryPage />
      <Content>
        <Page>
          <Card
            contentStyle={{
              p: 'space.00',
            }}
            footer={
              <Button width="100%" onClick={() => void navigate(RouteUrls.Home)}>
                Done
              </Button>
            }
          >
            <TxDone />
            <InfoCardAssetValue
              fiatSymbol={txFiatValueSymbol}
              fiatValue={txFiatValue}
              px="space.05"
              symbol={symbol}
              value={txValue}
            />

            <Stack pb="space.06" px="space.06" width="100%">
              <InfoCardRow title="To" value={<FormAddressDisplayer address={recipient} />} />
              <InfoCardSeparator />
              <InfoCardRow title="Sending" value={[txValue, symbol].filter(Boolean).join(' ')} />
              {feeRowValue && <InfoCardRow title="Fee" value={feeRowValue} />}
              {memoDisplayText && <InfoCardRow title="Memo" value={memoDisplayText} />}
              {proposalId && (
                <InfoCardRow title="Proposal ID" value={truncateMiddle(proposalId, 6)} />
              )}
              <InfoCardRow title="Status" value="Awaiting co-signers" />
            </Stack>
          </Card>
        </Page>
      </Content>
    </>
  );
}
