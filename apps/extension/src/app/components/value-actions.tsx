import { Fragment, type KeyboardEvent, type ReactNode } from 'react';

import { css, cx } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

import { CheckmarkIcon, CopyIcon, ExternalLinkIcon } from '@leather.io/ui';
import { isEven, truncateMiddle } from '@leather.io/utils';

import { useClipboard } from '@app/common/hooks/use-copy-to-clipboard';

const iconSize = 12;
const indicatorWidth = '20px';
const addressGroupSize = 4;

type ValueActionTone = 'default' | 'subdued';

const valueActionStyles = css({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 'sm',
  textStyle: 'caption.01',
  textAlign: 'left',
  textDecoration: 'underline',
  textDecorationColor: 'ink.border-default',
  textDecorationThickness: '1px',
  textUnderlineOffset: '3px',
  cursor: 'pointer',
  outline: 0,
  '--value-indicator-width': '0px',
  '--value-indicator-opacity': '0',
  _hover: {
    bg: 'ink.component-background-hover',
    textDecoration: 'none',
    '--value-indicator-width': indicatorWidth,
    '--value-indicator-opacity': '1',
  },
  _focusVisible: {
    textDecoration: 'none',
    '--value-indicator-width': indicatorWidth,
    '--value-indicator-opacity': '1',
  },
});

const toneStyles: Record<ValueActionTone, string> = {
  default: css({ color: 'ink.text-primary', _hover: { color: 'ink.text-primary' } }),
  subdued: css({ color: 'ink.text-subdued', _hover: { color: 'ink.text-primary' } }),
};

const revealedStyles = css({
  '--value-indicator-width': indicatorWidth,
  '--value-indicator-opacity': '1',
});

const indicatorStyles = css({
  display: 'inline-flex',
  overflow: 'hidden',
  width: 'var(--value-indicator-width)',
  opacity: 'var(--value-indicator-opacity)',
  transition: 'width 140ms ease, opacity 140ms ease',
});

const addressActionStyles = css({
  display: 'inline',
  py: 'space.01',
  lineHeight: '1.6',
  cursor: 'pointer',
  outline: 0,
  transition: 'background 140ms ease',
  '--value-indicator-width': '0px',
  '--value-indicator-opacity': '0',
  _hover: {
    bg: 'ink.background-secondary',
    '--value-indicator-width': indicatorWidth,
    '--value-indicator-opacity': '1',
  },
  _focusVisible: {
    bg: 'ink.background-secondary',
    '--value-indicator-width': indicatorWidth,
    '--value-indicator-opacity': '1',
  },
});

function groupAddress(address: string) {
  return address.match(new RegExp(`.{1,${addressGroupSize}}`, 'g')) ?? [];
}

interface ValueIndicatorProps {
  children: ReactNode;
}

function ValueIndicator({ children }: ValueIndicatorProps) {
  return (
    <styled.span className={indicatorStyles}>
      <styled.span display="flex" pl="space.01">
        {children}
      </styled.span>
    </styled.span>
  );
}

interface CopyIndicatorProps {
  hasCopied: boolean;
}

function CopyIndicator({ hasCopied }: CopyIndicatorProps) {
  return (
    <ValueIndicator>
      {hasCopied ? (
        <CheckmarkIcon
          variant="small"
          width={iconSize}
          height={iconSize}
          color="green.action-primary-default"
        />
      ) : (
        <CopyIcon variant="small" width={iconSize} height={iconSize} color="ink.text-subdued" />
      )}
    </ValueIndicator>
  );
}

interface CopyValueProps {
  value: string;
  display?: ReactNode;
  tone?: ValueActionTone;
  testId?: string;
}

export function CopyValue({ value, display, tone = 'subdued', testId }: CopyValueProps) {
  const { onCopy, hasCopied } = useClipboard(value);

  return (
    <styled.button
      type="button"
      onClick={onCopy}
      title="Copy"
      className={cx(valueActionStyles, toneStyles[tone], hasCopied ? revealedStyles : undefined)}
      data-testid={testId}
    >
      {display ?? truncateMiddle(value)}
      <CopyIndicator hasCopied={hasCopied} />
    </styled.button>
  );
}

interface CopyAddressProps {
  address: string;
  testId?: string;
}

export function CopyAddress({ address, testId }: CopyAddressProps) {
  const { onCopy, hasCopied } = useClipboard(address);
  const groups = groupAddress(address);

  function onKeyActivate(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCopy();
    }
  }

  return (
    <styled.span display="block">
      <styled.span
        role="button"
        tabIndex={0}
        onClick={onCopy}
        onKeyDown={onKeyActivate}
        title="Copy"
        className={cx(addressActionStyles, hasCopied ? revealedStyles : undefined)}
        data-testid={testId}
      >
        {groups.map((group, index) => {
          const color = isEven(index) ? 'ink.text-primary' : 'ink.text-subdued';
          const separator = index > 0 ? ' ' : null;
          if (index < groups.length - 1) {
            return (
              <Fragment key={index}>
                {separator}
                <styled.span textStyle="address" color={color}>
                  {group}
                </styled.span>
              </Fragment>
            );
          }
          return (
            <Fragment key={index}>
              {separator}
              <styled.span whiteSpace="nowrap">
                <styled.span textStyle="address" color={color}>
                  {group}
                </styled.span>
                <CopyIndicator hasCopied={hasCopied} />
              </styled.span>
            </Fragment>
          );
        })}
      </styled.span>
    </styled.span>
  );
}

interface LinkValueProps {
  href: string;
  children: ReactNode;
  tone?: ValueActionTone;
}

export function LinkValue({ href, children, tone = 'default' }: LinkValueProps) {
  return (
    <styled.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(valueActionStyles, toneStyles[tone])}
    >
      {children}
      <ValueIndicator>
        <ExternalLinkIcon
          variant="small"
          width={iconSize}
          height={iconSize}
          color="ink.text-subdued"
        />
      </ValueIndicator>
    </styled.a>
  );
}
