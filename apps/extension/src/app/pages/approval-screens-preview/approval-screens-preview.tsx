import type { ReactNode } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import { Approver, Button, CheckmarkIcon, Flag } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { TransactionRecipientsLayout } from '@app/components/rpc-transaction-request/transaction-recipients.layout';
import { SelectedFeeItem } from '@app/features/fee-editor/components/selected-fee-item';
import { MessageSigningHeader } from '@app/features/message-signer/message-signing-header';
import { NonceItem } from '@app/features/nonce-editor/nonce-item';
import { AccountApproverSection } from '@app/features/rpc-stacks-transaction-request/signing-account-card/signing-account-card';
import { ContractCallDetailsLayout } from '@app/features/rpc-stacks-transaction-request/stacks/contract-call/contract-call-details.layout';
import { ContractDeployDetailsLayout } from '@app/features/rpc-stacks-transaction-request/stacks/contract-deploy/contract-deploy-details.layout';
import { PostConditionsDetailsLayout } from '@app/features/rpc-stacks-transaction-request/stacks/post-conditions/post-conditions-details.layout';

import {
  previewAccountAddress,
  previewBalance,
  previewContractCall,
  previewContractDeploy,
  previewConvertToFiat,
  previewFee,
  previewFiatBalance,
  previewLargeRecipients,
  previewMarketData,
  previewMultisigAddress,
  previewMultisigBalance,
  previewMultisigFiatBalance,
  previewNonce,
  previewPostConditions,
  previewRequester,
  previewSmallRecipients,
  previewSponsoredFee,
} from './approval-screens-preview.fixtures';

function AccountAvatar({ color = '#f97316' }: { color?: string }) {
  return <Box width="36px" height="36px" borderRadius="50%" style={{ background: color }} />;
}

function AssetAvatar() {
  return <Box width="36px" height="36px" borderRadius="50%" style={{ background: '#5546FF' }} />;
}

interface CellProps {
  title: string;
  note: string;
  children: ReactNode;
}
function Cell({ title, note, children }: CellProps) {
  return (
    <Stack gap="space.02" width="390px" flexShrink={0}>
      <styled.h2 textStyle="label.02">{title}</styled.h2>
      <styled.p textStyle="caption.01" color="ink.text-subdued" minHeight="40px">
        {note}
      </styled.p>
      <Box
        bg="ink.background-primary"
        borderWidth="1px"
        borderColor="ink.border-default"
        borderRadius="12px"
        overflow="hidden"
        position="relative"
        height="756px"
        style={{ contain: 'paint' }}
      >
        {children}
      </Box>
    </Stack>
  );
}

function ApproverCell({ title, note, children }: CellProps) {
  return (
    <Cell title={title} note={note}>
      <Approver requester={previewRequester} width="100%">
        {children}
      </Approver>
    </Cell>
  );
}

function PreviewAccountSection({ subheader = 'With account' }: { subheader?: string }) {
  return (
    <AccountApproverSection
      subheader={subheader}
      avatar={<AccountAvatar />}
      name="Account 1"
      caption={truncateMiddle(previewAccountAddress)}
      titleRight={formatCurrency(previewBalance)}
      captionRight={formatCurrency(previewFiatBalance)}
    />
  );
}

function PreviewFeeRow({ isSponsored = false }: { isSponsored?: boolean }) {
  return (
    <SelectedFeeItem
      feeType="fee-value"
      isLoading={false}
      isSponsored={isSponsored}
      marketData={previewMarketData}
      onEditFee={() => null}
      selectedFee={isSponsored ? previewSponsoredFee : previewFee}
    />
  );
}

function PreviewActions({ cancel = 'Cancel', approve = 'Approve' }) {
  return (
    <Approver.Actions
      actions={[
        <Button key="cancel" variant="outline">
          {cancel}
        </Button>,
        <Button key="approve">{approve}</Button>,
      ]}
    />
  );
}

// ts-unused-exports:disable-next-line
export function ApprovalScreensPreviewPage() {
  return (
    <Box p="space.05" bg="ink.background-secondary" minHeight="100%" overflowY="auto">
      <styled.h1 textStyle="heading.04" mb="space.02">
        Approval screens — live components
      </styled.h1>
      <styled.p textStyle="body.02" color="ink.text-subdued" maxWidth="80ch" mb="space.05">
        The real approval-screen components rendered with fake props, at popup width. Edit any of
        them and every cell here updates. Fixtures live next to this page in{' '}
        <styled.span textStyle="code">approval-screens-preview.fixtures.ts</styled.span>. Not a
        substitute for the captured screenshots — those go through the real containers and prove the
        wiring; this shows the layouts.
      </styled.p>

      <Flex gap="space.06" flexWrap="wrap" alignItems="flex-start">
        <ApproverCell
          title="Shared header"
          note="Approver.Header — the header used by every modern approval screen. Origin comes from the requester prop; there is no network and no port."
        >
          <Approver.Header title="Sign contract" />
        </ApproverCell>

        <ApproverCell
          title="Contract call"
          note="Post conditions, account, contract details, fee, nonce. Contract details resolve the ABI over the network, so argument names may load or fall back to 'unknown'."
        >
          <Approver.Header title="Sign contract" />
          <PostConditionsDetailsLayout postConditions={previewPostConditions} />
          <PreviewAccountSection />
          <ContractCallDetailsLayout {...previewContractCall} />
          <PreviewFeeRow />
          <NonceItem nonce={previewNonce} onEditNonce={() => null} />
          <PreviewActions />
        </ApproverCell>

        <ApproverCell
          title="Post conditions — allow mode"
          note="In allow mode the warning replaces the list entirely, so a screen shows either a warning or a list, never both."
        >
          <Approver.Header title="Sign transaction" />
          <PostConditionsDetailsLayout postConditions={[]} postConditionMode="allow" />
          <PreviewAccountSection />
          <PreviewFeeRow />
          <PreviewActions />
        </ApproverCell>

        <ApproverCell
          title="Contract deploy"
          note="Clarity source rendered inline and always visible — the only screen that shows its whole payload."
        >
          <Approver.Header title="Deploy contract" />
          <PreviewAccountSection />
          <ContractDeployDetailsLayout {...previewContractDeploy} />
          <PreviewFeeRow />
          <PreviewActions />
        </ApproverCell>

        <ApproverCell
          title="Transfer — 1.5 STX"
          note="The reference layout: account, amount, recipient, fee, nonce, actions."
        >
          <Approver.Header title="Send token" />
          <PreviewAccountSection />
          <TransactionRecipientsLayout
            title="Stacks"
            caption="Stacks blockchain"
            avatar={<AssetAvatar />}
            convertToFiatAmount={previewConvertToFiat}
            recipients={previewSmallRecipients}
          />
          <PreviewFeeRow />
          <NonceItem nonce={previewNonce} onEditNonce={() => null} />
          <PreviewActions />
        </ApproverCell>

        <ApproverCell
          title="Transfer — 1,234,999 STX"
          note="Same components, larger amount. This is the rounding case: it renders as 1.23M STX because compact notation is the default above one million."
        >
          <Approver.Header title="Send token" />
          <PreviewAccountSection />
          <TransactionRecipientsLayout
            title="Stacks"
            caption="Stacks blockchain"
            avatar={<AssetAvatar />}
            convertToFiatAmount={previewConvertToFiat}
            recipients={previewLargeRecipients}
          />
          <PreviewFeeRow />
          <PreviewActions />
        </ApproverCell>

        <ApproverCell
          title="Multisig co-sign"
          note="Two account sections, and no fee or nonce row at all — the co-signer cannot see either value they are signing."
        >
          <Approver.Header title="Sign transaction" />
          <AccountApproverSection
            subheader="Transacting with account"
            avatar={<AccountAvatar color="#0ea5e9" />}
            name="Treasury 2-of-3"
            caption={truncateMiddle(previewMultisigAddress)}
            titleRight={formatCurrency(previewMultisigBalance)}
            captionRight={formatCurrency(previewMultisigFiatBalance)}
          />
          <AccountApproverSection
            subheader="Signing with account"
            avatar={<AccountAvatar />}
            name="Account 1"
            caption={truncateMiddle(previewAccountAddress)}
          />
          <TransactionRecipientsLayout
            title="Stacks"
            caption="Stacks blockchain"
            avatar={<AssetAvatar />}
            convertToFiatAmount={previewConvertToFiat}
            recipients={previewLargeRecipients}
          />
          <PreviewActions />
        </ApproverCell>

        <ApproverCell
          title="Sponsored fee"
          note="The fee row's third state, for comparison with the standard and multisig cases."
        >
          <Approver.Header title="Sign transaction" />
          <PreviewAccountSection />
          <PreviewFeeRow isSponsored />
          <PreviewActions />
        </ApproverCell>

        <ApproverCell
          title="Connect app"
          note="Same shared header, different body and different button labels — Deny and Confirm rather than Cancel and Approve."
        >
          <Approver.Header title="Connect app" />
          <PreviewAccountSection />
          <Approver.Section>
            <Approver.Subheader>This app would like to</Approver.Subheader>
            <Stack gap="space.03" pb="space.03">
              {['View your balances and activity', 'Request approval for transactions'].map(
                text => (
                  <Flag key={text} img={<CheckmarkIcon variant="small" />} width="100%">
                    <styled.p textStyle="caption.01">{text}</styled.p>
                  </Flag>
                )
              )}
            </Stack>
          </Approver.Section>
          <PreviewActions cancel="Deny" approve="Confirm" />
        </ApproverCell>

        <Cell
          title="Message signing header (legacy shell)"
          note="A different header component entirely: prints the full origin and the hostname, and is the only one that states the network."
        >
          <Box px="space.05" pb="space.05">
            <MessageSigningHeader origin={previewRequester} />
            <HStack justifyContent="space-between" mt="space.05">
              <styled.span textStyle="label.02">No fees are incurred</styled.span>
            </HStack>
          </Box>
        </Cell>
      </Flex>
    </Box>
  );
}
