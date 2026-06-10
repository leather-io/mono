import { useState } from 'react';

import { styled } from 'leather-styles/jsx';
import { useClipboardCopy } from '~/utils/use-clipboard-copy';

import { CheckmarkIcon, CopyIcon } from '@leather.io/ui';

import { formatAddress } from './use-chain-connection';

export function DropdownAddress({ address }: { address: string }) {
  const { copied, copy } = useClipboardCopy();
  const [hovered, setHovered] = useState(false);
  return (
    <styled.button
      type="button"
      onClick={() => copy(address)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Copy address"
      display="inline-flex"
      alignItems="center"
      gap="space.01"
      cursor="pointer"
      ml="-space.02"
      px="space.02"
      py="space.01"
      borderRadius="sm"
      bg="transparent"
      color="ink.text-subdued"
      textStyle="code"
      transition="background 0.1s ease"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <styled.span>{formatAddress(address)}</styled.span>
      {copied ? (
        <CheckmarkIcon variant="small" color="green.action-primary-default" />
      ) : (
        <CopyIcon variant="small" color={hovered ? 'ink.text-primary' : 'ink.text-subdued'} />
      )}
    </styled.button>
  );
}
