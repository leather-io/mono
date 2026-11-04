import { Stack, styled } from 'leather-styles/jsx';

import { Button, Callout, LoadingSpinner } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { StacksAddressDisplayer } from '@app/components/address-displayer/stacks-address-displayer';
import { InfoCardRow, InfoCardSeparator } from '@app/components/info-card/info-card';
import { Card, Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';

import { useMoveToFreshAccount } from './use-move-to-fresh-account';

function MoveToFreshAccountBody() {
  const {
    isAvailable,
    isCheckingFreshAccount,
    isLoading,
    isMoving,
    freshAddress,
    plan,
    planError,
    moveEverything,
  } = useMoveToFreshAccount();

  if (isCheckingFreshAccount || isLoading) return <LoadingSpinner height="300px" />;

  if (!isAvailable)
    return (
      <Callout variant="warning" title="No fresh account available">
        The next account has already sent transactions, or this wallet has no more accounts.
        Multisig accounts are not supported.
      </Callout>
    );

  if (planError || !plan)
    return (
      <Callout variant="warning" title="Unable to prepare the move">
        {planError ?? 'Try again later.'}
      </Callout>
    );

  const transactionCount = plan.transactions.length;

  return (
    <Card
      footer={
        <Button
          width="100%"
          aria-busy={isMoving}
          disabled={isMoving}
          onClick={() => void moveEverything()}
        >
          Move everything
        </Button>
      }
    >
      <Stack gap="space.04" px="space.05" py="space.05" width="100%">
        <styled.p textStyle="body.02">
          Move your assets to a new account that has never sent a transaction. Its public key is not
          on chain yet.
        </styled.p>
        <Stack gap="space.02">
          <InfoCardRow
            title="Fresh address"
            value={<StacksAddressDisplayer address={freshAddress} />}
          />
          <InfoCardSeparator />
          <InfoCardRow title="STX" value={formatCurrency(plan.stxAmount)} />
          {plan.tokens.map(token => (
            <InfoCardRow key={token.id} title="Token" value={token.label} />
          ))}
          {plan.nfts.map(nft => (
            <InfoCardRow key={nft.id} title="NFT" value={nft.label} />
          ))}
          <InfoCardSeparator />
          <InfoCardRow title="Transactions" value={String(transactionCount)} />
          <InfoCardRow title="Total fees" value={formatCurrency(plan.totalFee)} />
        </Stack>
        <Callout variant="info" title={`This sends ${transactionCount} transactions`}>
          Each token and NFT needs its own transaction, and STX moves last. On a Ledger, you approve
          each one on the device. Stacked STX stays at your current address. You switch to the new
          account after everything is sent.
        </Callout>
      </Stack>
    </Card>
  );
}

export function MoveToFreshAccountPage() {
  return (
    <>
      <PageHeader title="Move to a fresh account" onBackLocation={RouteUrls.Home} />
      <Content>
        <Page>
          <MoveToFreshAccountBody />
        </Page>
      </Content>
    </>
  );
}
