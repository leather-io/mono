import { type ReactNode, cloneElement, isValidElement } from 'react';

import { css, cx } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  type AddressDisplayerProps,
  ChevronRightIcon,
  CopyIcon,
} from '@leather.io/ui';

import { tactilePress } from './tactile-motion';

export const handshakeInteractiveSurface = css({
  bg: 'ink.background-secondary',
  borderWidth: 1,
  borderColor: 'ink.border-default',
  borderRadius: 'md',
  cursor: 'pointer',
  _hover: {
    backgroundImage:
      'linear-gradient(token(colors.ink.component-background-hover), token(colors.ink.component-background-hover))',
  },
  _active: {
    backgroundImage:
      'linear-gradient(token(colors.ink.component-background-pressed), token(colors.ink.component-background-pressed))',
  },
});

export const handshakeOutline = css({
  bg: 'ink.background-primary',
  borderWidth: 1,
  borderColor: 'ink.border-default',
  borderRadius: 'md',
});

export const handshakeFilledRow = cx(handshakeInteractiveSurface, tactilePress);

interface HandshakeLabelRowProps {
  label: ReactNode;
  trailing?: ReactNode;
}

export function HandshakeLabelRow({ label, trailing }: HandshakeLabelRowProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.03"
      minWidth={0}
      minHeight="20px"
    >
      <styled.span textStyle="label.03" color="ink.text-subdued" minWidth={0}>
        {label}
      </styled.span>
      {trailing && (
        <styled.span
          display="inline-flex"
          alignItems="center"
          textStyle="label.03"
          color="ink.text-subdued"
          flexShrink={0}
        >
          {trailing}
        </styled.span>
      )}
    </Flex>
  );
}

interface HandshakeValueRowProps {
  icon?: ReactNode;
  children: ReactNode;
}

export function HandshakeValueRow({ icon, children }: HandshakeValueRowProps) {
  return (
    <Flex gap="space.03" alignItems="flex-start" minWidth={0}>
      {icon && (
        <Flex
          width="32px"
          minHeight="36px"
          flexShrink={0}
          alignItems="center"
          justifyContent="center"
          lineHeight={0}
        >
          {icon}
        </Flex>
      )}
      {children}
    </Flex>
  );
}

interface HandshakeTileProps {
  shape?: 'round' | 'square';
  children: ReactNode;
}

export function HandshakeTile({ shape = 'round', children }: HandshakeTileProps) {
  return (
    <Flex
      width="32px"
      height="32px"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      borderRadius={shape === 'round' ? 'round' : 'sm'}
      borderWidth={1}
      borderColor="ink.border-default"
      bg="ink.background-primary"
      lineHeight={0}
      aria-hidden
    >
      {children}
    </Flex>
  );
}

interface HandshakeActionCueProps {
  label: string;
  kind?: 'change' | 'copy';
}

export function HandshakeActionCue({ label, kind = 'change' }: HandshakeActionCueProps) {
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      gap="space.01"
      minHeight="28px"
      textStyle="label.03"
      color="ink.text-primary"
      flexShrink={0}
      whiteSpace="nowrap"
    >
      {kind === 'copy' && <CopyIcon variant="small" />}
      {label}
      {kind === 'change' && <ChevronRightIcon variant="small" color="ink.text-subdued" />}
    </styled.span>
  );
}

interface HandshakeAddressProps {
  children: ReactNode;
}

export function HandshakeAddress({ children }: HandshakeAddressProps) {
  if (isValidElement<AddressDisplayerProps>(children) && children.type === AddressDisplayer) {
    return cloneElement(children, { textStyle: 'code' });
  }
  return children;
}
