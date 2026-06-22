import { useEffect, useRef, useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { AddressDisplayer, CheckmarkIcon, CopyIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

interface CopyAddressProps {
  addr: string;
  full?: boolean;
  grouped?: boolean;
  emphasis?: boolean;
}

const COPIED_RESET_MS = 1400;

// Mono-font address with click-to-copy. Uses the Clipboard API directly (a
// design-only convenience); production extraction routes through the app's
// clipboard hook.
export function CopyAddress({ addr, full, grouped, emphasis }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>();
  const multiline = grouped || full;
  useEffect(() => {
    return () => {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
    };
  }, []);
  async function onCopy() {
    try {
      await navigator.clipboard?.writeText(addr);
    } catch {
      return;
    }
    setCopied(true);
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    resetTimeout.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }
  return (
    <styled.button
      type="button"
      onClick={() => void onCopy()}
      title="Copy address"
      display="inline-flex"
      alignItems={multiline ? 'flex-start' : 'center'}
      gap="space.02"
      maxWidth="100%"
      textAlign="left"
      cursor="pointer"
      px="space.02"
      py="space.01"
      borderRadius="sm"
      bg="transparent"
      color={emphasis ? 'ink.text-primary' : 'ink.text-subdued'}
      transition="background 0.1s ease"
      _hover={{ bg: 'ink.component-background-hover', color: 'ink.text-primary' }}
    >
      {grouped ? (
        <AddressDisplayer address={addr} minWidth={0} />
      ) : (
        <styled.span
          textStyle="code"
          fontSize={emphasis ? '1rem' : undefined}
          flexShrink={0}
          whiteSpace={full ? 'normal' : 'nowrap'}
          wordBreak={full ? 'break-all' : 'normal'}
        >
          {full ? addr : truncateMiddle(addr)}
        </styled.span>
      )}
      <styled.span
        flexShrink={0}
        display="inline-flex"
        alignItems="center"
        mt={multiline ? 'space.01' : '0'}
      >
        {copied ? (
          <CheckmarkIcon variant="small" color="green.text-secondary" />
        ) : (
          <CopyIcon variant="small" />
        )}
      </styled.span>
    </styled.button>
  );
}
