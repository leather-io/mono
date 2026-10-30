import type { ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, Badge, BtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { AddressQr } from './address-qr';
import { HelperText } from './inline-info';
import { defineRecipeMeta } from './recipe-meta';

export const receiveAssetIdentityMeta = defineRecipeMeta({
  name: 'Receive asset identity and address block',
  mirrors:
    'Owner-reviewed direction, 26 Oct 2026; not a literal extension mirror. Badge precedent: apps/mobile/src/features/receive/components/receive-asset-item.tsx. Address grouping: apps/extension/src/app/pages/receive/components/receive-tokens.layout.tsx',
  useWhen: [
    'Receive chooser rows and detail headings: use the same asset name and protocol chip',
    'Keep Receive in the page header once; the body identifies the asset',
    'ReceiveAddressBlock fixes 24px major gaps, a 16px account/address gap and a centered 300px address measure',
  ],
  dontUseWhen: [
    {
      situation: 'A task heading such as Receive Bitcoin (Taproot)',
      use: 'FramePage title Receive plus ReceiveAssetIdentity',
    },
  ],
});

type ReceiveProtocol = 'segwit' | 'taproot' | 'stacks';

interface ReceiveAssetIdentityProps {
  protocol: ReceiveProtocol;
  context: 'row' | 'detail';
}

export function ReceiveAssetIdentity({ protocol, context }: ReceiveAssetIdentityProps) {
  const asset = protocol === 'stacks' ? 'Stacks' : 'Bitcoin';
  const protocolLabel = protocol === 'segwit' ? 'Native SegWit' : 'Taproot';
  return (
    <Flex
      alignItems="center"
      gap="space.02"
      flexWrap="wrap"
      justifyContent={context === 'detail' ? 'center' : 'flex-start'}
    >
      {context === 'detail' ? (
        <styled.h2 textStyle="heading.05" color="ink.text-primary">
          {asset}
        </styled.h2>
      ) : (
        <styled.span textStyle="label.01" color="ink.text-primary">
          {asset}
        </styled.span>
      )}
      {protocol !== 'stacks' ? (
        <Badge label={protocolLabel} size="sm" textColor="primary" flexShrink={0} />
      ) : null}
    </Flex>
  );
}

interface ReceiveAddressBlockProps {
  protocol: ReceiveProtocol;
  address: string;
  accountName: string;
  reminder: string;
  feedback?: ReactNode;
}

export function ReceiveAddressBlock({
  protocol,
  address,
  accountName,
  reminder,
  feedback,
}: ReceiveAddressBlockProps) {
  return (
    <Stack gap="space.05" alignItems="center">
      <ReceiveAssetIdentity protocol={protocol} context="detail" />
      <AddressQr
        address={address}
        icon={protocol === 'stacks' ? <StxAvatarIcon /> : <BtcAvatarIcon />}
      />
      <Stack gap="space.04" alignItems="center" width="100%">
        <styled.p textStyle="label.01" color="ink.text-primary" textAlign="center">
          {accountName}
        </styled.p>
        <AddressDisplayer address={address} justifyContent="center" maxWidth="300px" />
      </Stack>
      <HelperText centered>{reminder}</HelperText>
      {feedback}
    </Stack>
  );
}
