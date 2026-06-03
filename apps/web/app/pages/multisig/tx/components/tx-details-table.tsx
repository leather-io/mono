import { Box, Flex, styled } from 'leather-styles/jsx';

import { CopyAddress } from '../../components/copy-address';
import { StatusPill } from '../../components/status-pill';
import type { MultisigTransaction, Vault } from '../../data/multisig-types';

interface TxDetailsTableProps {
  vault: Vault;
  tx: MultisigTransaction;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      gap="space.04"
      px="space.04"
      py="space.03"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-default"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
        {label}
      </styled.span>
      <Box textStyle="label.02" textAlign="right" minWidth={0}>
        {children}
      </Box>
    </Flex>
  );
}

export function TxDetailsTable({ vault, tx }: TxDetailsTableProps) {
  const isBtc = vault.chain === 'btc';
  const recipient = isBtc
    ? 'bc1qsnpv5h9k3p7w2x8r4tnvyu0d5h6f0jgk8m4cqfltm9phf8x2axqs4vym3p'
    : 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR';
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Flex justifyContent="space-between" alignItems="center" px="space.04" py="space.03">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Status
        </styled.span>
        <StatusPill status={tx.status} />
      </Flex>
      <Row label="Initiator">
        {tx.proposerName}
        {tx.proposerUserId === 'me' ? ' (you)' : ''}
      </Row>
      <Row label="Initiation date">{tx.proposedAt}</Row>
      <Row label="Recipient">
        <CopyAddress addr={recipient} grouped />
      </Row>
      <Row label="Amount">{tx.amount}</Row>
      <Row label="Fee">{isBtc ? '0.00023 BTC ≈ $15.50' : '0.0125 STX ≈ $0.01'}</Row>
      <Row label="Network">{isBtc ? 'Bitcoin mainnet' : 'Stacks mainnet'}</Row>
      <Row label="Signature type">{isBtc ? 'PSBT (BIP-174)' : 'Standard multisig (SIP-005)'}</Row>
    </Box>
  );
}
