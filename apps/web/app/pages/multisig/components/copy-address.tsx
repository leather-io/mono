import { type KeyboardEvent } from 'react';

import { styled } from 'leather-styles/jsx';

import { CheckmarkIcon, CopyIcon, useClipboard } from '@leather.io/ui';
import { isEven, truncateMiddle } from '@leather.io/utils';

interface CopyAddressProps {
  addr: string;
  full?: boolean;
  grouped?: boolean;
  emphasis?: boolean;
}

const iconSize = 12;

function groupByFour(addr: string): string[] {
  return addr.match(/.{1,4}/g) ?? [];
}

// Mono-font address with click-to-copy via the app's shared useClipboard
// hook. One muted style for truncated + full (full just wraps); grouped is
// the multi-line block where the copy icon trails the address.
export function CopyAddress({ addr, full, grouped, emphasis }: CopyAddressProps) {
  const { onCopy, hasCopied } = useClipboard(addr);

  const icon = (
    <styled.span flexShrink={0} display="inline-flex" alignItems="center" verticalAlign="middle">
      {hasCopied ? (
        <CheckmarkIcon
          variant="small"
          width={iconSize}
          height={iconSize}
          color="green.text-secondary"
        />
      ) : (
        <CopyIcon variant="small" width={iconSize} height={iconSize} color="ink.text-subdued" />
      )}
    </styled.span>
  );

  function onKeyActivate(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCopy();
    }
  }

  if (grouped) {
    // Per-line background (box-decoration-break: clone) so the hover wraps around
    // the text — each wrapped line is hugged, not one filled rectangle. The tight
    // line-height overlaps the lines (opaque bg) into one connected shape. The
    // line-end corners are convex: a single hugging shape with concave step
    // corners isn't possible in clean CSS (it needs a filter/JS hack). The block
    // wrapper + negative margin keep every line aligned with the label above.
    return (
      <styled.span display="block" ml="-space.01">
        <styled.span
          role="button"
          tabIndex={0}
          onClick={onCopy}
          onKeyDown={onKeyActivate}
          title="Copy address"
          display="inline"
          style={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}
          cursor="pointer"
          px="space.01"
          py="space.01"
          lineHeight="1.4"
          borderRadius="sm"
          transition="background 0.1s ease"
          _hover={{ bg: 'ink.background-secondary' }}
        >
          {groupByFour(addr).map((group, index) => (
            <styled.span
              key={index}
              textStyle="address"
              color={isEven(index) ? 'ink.text-primary' : 'ink.text-subdued'}
            >
              {group}{' '}
            </styled.span>
          ))}
          {icon}
        </styled.span>
      </styled.span>
    );
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
      textAlign="left"
      cursor="pointer"
      px="space.01"
      // No vertical padding: the hover container is one text-line tall, so an
      // address caption takes the same row height as a plain-text caption — rows
      // don't grow taller just because they show an address.
      py="0"
      // Negative left margin cancels the left padding so the address text lines up
      // with the title/label above it — the hover container keeps its padding and
      // just extends outward instead of denting the text inward.
      ml="-space.01"
      borderRadius="sm"
      bg="transparent"
      color={emphasis ? 'ink.text-primary' : 'ink.text-subdued'}
      transition="background 0.1s ease"
      _hover={{ bg: 'ink.component-background-hover', color: 'ink.text-primary' }}
    >
      <styled.span
        textStyle="code"
        fontSize={emphasis ? '15px' : '12px'}
        lineHeight="20px"
        flexShrink={0}
        whiteSpace={full ? 'normal' : 'nowrap'}
        wordBreak={full ? 'break-all' : 'normal'}
      >
        {full ? addr : truncateMiddle(addr)}
      </styled.span>
      {icon}
    </styled.button>
  );
}
