import { Stack, styled } from 'leather-styles/jsx';

import { Button, Callout, LoadingSpinner } from '@leather.io/ui';

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
    isLedger,
    lockedStx,
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
      contentStyle={{ p: 'space.00' }}
      footer={
        <Button
          width="100%"
          aria-busy={isMoving}
          disabled={isMoving}
          onClick={() => void moveEverything()}
        >
          Move Stacks assets
        </Button>
      }
    >
      <Stack gap="space.04" px="space.05" py="space.05" width="100%">
        <styled.p textStyle="body.02">
          Moves your STX, Stacks tokens and Stacks NFTs (including BNS names) to a new account that
          has never sent a transaction. Your Bitcoin stays where it is.
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
          {plan.blockedNfts.length > 0 && (
            <>
              <InfoCardSeparator />
              <styled.p textStyle="label.02">Stays behind</styled.p>
              {plan.blockedNfts.map(nft => (
                <InfoCardRow key={nft.id} title={nft.label} value={nft.reason} />
              ))}
            </>
          )}
          <InfoCardSeparator />
          <InfoCardRow title="Transactions" value={String(transactionCount)} />
          <InfoCardRow title="Total fees" value={formatCurrency(plan.totalFee)} />
        </Stack>
        <Callout variant="info" title={`This sends ${transactionCount} transactions`}>
          <styled.ul listStyleType="disc" pl="space.04">
            <styled.li>Each token and NFT moves in its own transaction. STX moves last.</styled.li>
            {isLedger && <styled.li>You approve each one on your Ledger.</styled.li>}
            {lockedStx && (
              <styled.li>
                {formatCurrency(lockedStx)} of stacked STX stays at your current address.
              </styled.li>
            )}
            {plan.nfts.length > 0 && (
              <styled.li>
                If an NFT contract blocks transfers, that NFT stays at your current address (but the
                fee is spent).
              </styled.li>
            )}
            <styled.li>You switch to the new account after everything is sent.</styled.li>
          </styled.ul>
        </Callout>
      </Stack>
    </Card>
  );
}

export function MoveToFreshAccountPage() {
  return (
    <>
      <PageHeader title="Move assets" />
      <Content>
        <Page>
          <MoveToFreshAccountBody />
        </Page>
      </Content>
    </>
  );
}
