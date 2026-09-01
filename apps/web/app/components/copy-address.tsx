import { type KeyboardEvent } from 'react';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

import { CheckmarkIcon, CopyIcon, ExternalLinkIcon, useClipboard } from '@leather.io/ui';
import { isEven, truncateMiddle } from '@leather.io/utils';

interface CopyAddressProps {
  addr: string;
  full?: boolean;
  grouped?: boolean;
  emphasis?: boolean;
  // wide: fill the available width. The full address shows when it fits;
  // when it doesn't, the head ellipsizes against a fixed tail so it reads as
  // middle truncation — never wrapping to a second line. Pure CSS, so the
  // cutover adapts to the container without measurement.
  wide?: boolean;
  compact?: boolean;
  underlined?: boolean;
}

const iconSize = 12;
const wideTailChars = 5;
const compactLineHeight = '16px';
const defaultLineHeight = '20px';

function groupByFour(addr: string): string[] {
  return addr.match(/.{1,4}/g) ?? [];
}

const underlineClass = css({
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'ink.text-non-interactive',
  _groupHover: { borderBottomColor: 'transparent' },
});

const iconFollowsTextOnHoverClass = css({
  _groupHover: { '& svg': { color: 'ink.text-primary' } },
});

interface AddressTextProps {
  addr: string;
  full?: boolean;
  wide?: boolean;
  compact?: boolean;
  underlined?: boolean;
}

function AddressText({ addr, full, wide, compact, underlined }: AddressTextProps) {
  if (wide) {
    return (
      <styled.span
        textStyle="code"
        lineHeight={compact ? compactLineHeight : defaultLineHeight}
        display="flex"
        minWidth={0}
        whiteSpace="nowrap"
        className={underlined ? underlineClass : undefined}
      >
        <styled.span overflow="hidden" textOverflow="ellipsis" minWidth={0}>
          {addr.slice(0, -wideTailChars)}
        </styled.span>
        <styled.span flexShrink={0}>{addr.slice(-wideTailChars)}</styled.span>
      </styled.span>
    );
  }

  return (
    <styled.span
      textStyle="code"
      lineHeight={compact ? compactLineHeight : defaultLineHeight}
      flexShrink={0}
      whiteSpace={full ? 'normal' : 'nowrap'}
      wordBreak={full ? 'break-all' : 'normal'}
      className={underlined ? underlineClass : undefined}
    >
      {full ? addr : truncateMiddle(addr)}
    </styled.span>
  );
}

interface ExternalAddressProps {
  addr: string;
  href: string;
  wide?: boolean;
  compact?: boolean;
  emphasis?: boolean;
  underlined?: boolean;
}

export function ExternalAddress({
  addr,
  href,
  wide,
  compact,
  emphasis,
  underlined,
}: ExternalAddressProps) {
  return (
    <styled.a
      className="group"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="View in explorer"
      display="inline-flex"
      alignItems="center"
      gap="space.01"
      maxWidth="100%"
      textAlign="left"
      cursor="pointer"
      px="space.01"
      py="0"
      ml="-space.01"
      borderRadius="sm"
      bg="transparent"
      color={emphasis ? 'ink.text-primary' : 'ink.text-subdued'}
      transition="background 0.1s ease"
      _hover={{ bg: 'ink.component-background-hover', color: 'ink.text-primary' }}
    >
      <AddressText addr={addr} wide={wide} compact={compact} underlined={underlined} />
      <styled.span
        flexShrink={0}
        display="inline-flex"
        alignItems="center"
        className={iconFollowsTextOnHoverClass}
      >
        <ExternalLinkIcon
          variant="small"
          width={iconSize}
          height={iconSize}
          color="ink.text-subdued"
        />
      </styled.span>
    </styled.a>
  );
}

// Mono-font address with click-to-copy via the app's shared useClipboard
// hook. One muted style for truncated + full (full just wraps); grouped is
// the multi-line block where the copy icon trails the address.
export function CopyAddress({
  addr,
  full,
  grouped,
  emphasis,
  wide,
  compact,
  underlined,
}: CopyAddressProps) {
  const { onCopy, hasCopied } = useClipboard(addr);

  const icon = hasCopied ? (
    <styled.span flexShrink={0} display="inline-flex" alignItems="center" verticalAlign="middle">
      <CheckmarkIcon
        variant="small"
        width={iconSize}
        height={iconSize}
        color="green.text-secondary"
      />
    </styled.span>
  ) : (
    <styled.span
      flexShrink={0}
      display="inline-flex"
      alignItems="center"
      verticalAlign="middle"
      className={iconFollowsTextOnHoverClass}
    >
      <CopyIcon variant="small" width={iconSize} height={iconSize} color="ink.text-subdued" />
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
      <styled.span display="block" ml="-space.01" style={{ textWrap: 'balance' }}>
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
          {groupByFour(addr).map((group, index, groups) =>
            index < groups.length - 1 ? (
              <styled.span
                key={index}
                textStyle="code"
                color={isEven(index) ? 'ink.text-primary' : 'ink.text-subdued'}
              >
                {group}{' '}
              </styled.span>
            ) : (
              <styled.span key={index} whiteSpace="nowrap">
                <styled.span
                  textStyle="code"
                  color={isEven(index) ? 'ink.text-primary' : 'ink.text-subdued'}
                >
                  {group}{' '}
                </styled.span>
                {icon}
              </styled.span>
            )
          )}
        </styled.span>
      </styled.span>
    );
  }

  return (
    <styled.button
      className="group"
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
      <AddressText addr={addr} full={full} wide={wide} compact={compact} underlined={underlined} />
      {icon}
    </styled.button>
  );
}
