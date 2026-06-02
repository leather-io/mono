import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { CheckmarkIcon, CopyIcon } from '@leather.io/ui';

interface CopyAddressProps {
  addr: string;
  full?: boolean;
}

function truncate(addr: string): string {
  return addr.length > 18 ? `${addr.slice(0, 9)}…${addr.slice(-7)}` : addr;
}

const COPIED_RESET_MS = 1400;

// Mono-font address with click-to-copy. Uses the Clipboard API directly (a
// design-only convenience); production extraction routes through the app's
// clipboard hook.
export function CopyAddress({ addr, full }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);
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
      alignItems="center"
      gap="space.01"
      maxWidth="100%"
      cursor="pointer"
      bg="transparent"
      color="ink.text-subdued"
      fontFamily="firaCode"
      fontSize="13px"
      lineHeight="1.4"
      _hover={{ color: 'ink.text-primary' }}
    >
      <styled.span
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace={full ? 'normal' : 'nowrap'}
        wordBreak={full ? 'break-all' : 'normal'}
      >
        {full ? addr : truncate(addr)}
      </styled.span>
      {copied ? <CheckmarkIcon variant="small" /> : <CopyIcon variant="small" />}
    </styled.button>
  );
}
