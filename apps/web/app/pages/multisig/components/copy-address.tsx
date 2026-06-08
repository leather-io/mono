import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { AddressDisplayer, CheckmarkIcon, CopyIcon } from '@leather.io/ui';

import { truncateAddress } from './address-text';

interface CopyAddressProps {
  addr: string;
  full?: boolean;
  grouped?: boolean;
}

const COPIED_RESET_MS = 1400;

// Mono-font address with click-to-copy. Uses the Clipboard API directly (a
// design-only convenience); production extraction routes through the app's
// clipboard hook.
export function CopyAddress({ addr, full, grouped }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);
  const multiline = grouped || full;
  function onCopy() {
    void navigator.clipboard?.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }
  return (
    <styled.button
      type="button"
      onClick={onCopy}
      title="Copy address"
      display="inline-flex"
      alignItems={multiline ? 'flex-start' : 'center'}
      gap="space.02"
      maxWidth="100%"
      textAlign="left"
      cursor="pointer"
      ml="-space.02"
      px="space.02"
      py="space.01"
      borderRadius="sm"
      bg="transparent"
      color="ink.text-subdued"
      transition="background 0.1s ease"
      _hover={{ bg: 'ink.component-background-hover', color: 'ink.text-primary' }}
    >
      {grouped ? (
        <AddressDisplayer address={addr} minWidth={0} />
      ) : (
        <styled.span
          textStyle="code"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace={full ? 'normal' : 'nowrap'}
          wordBreak={full ? 'break-all' : 'normal'}
        >
          {full ? addr : truncateAddress(addr)}
        </styled.span>
      )}
      <styled.span
        flexShrink={0}
        display="inline-flex"
        alignItems="center"
        mt={multiline ? 'space.01' : '0'}
      >
        {copied ? <CheckmarkIcon variant="small" /> : <CopyIcon variant="small" />}
      </styled.span>
    </styled.button>
  );
}
