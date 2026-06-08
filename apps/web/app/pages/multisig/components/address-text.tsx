import { styled } from 'leather-styles/jsx';

export function truncateAddress(addr: string): string {
  return addr.length > 18 ? `${addr.slice(0, 9)}…${addr.slice(-7)}` : addr;
}

interface AddressTextProps {
  addr: string;
  full?: boolean;
}

// Non-interactive mono address (safe to place inside clickable cards, where a
// copy button would create a nested interactive element). Use CopyAddress on
// detail surfaces where copying is wanted.
export function AddressText({ addr, full }: AddressTextProps) {
  return (
    <styled.span
      display="block"
      textStyle="code"
      color="ink.text-subdued"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace={full ? 'normal' : 'nowrap'}
      wordBreak={full ? 'break-all' : 'normal'}
    >
      {full ? addr : truncateAddress(addr)}
    </styled.span>
  );
}
