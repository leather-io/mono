// The two rails' shared chrome: a sticky full-height column that collapses to
// a thin strip, its collapse button, and the small controls the left rail is
// made of (list buttons, segmented choices, switches, key hints). Canvas-only.
import { type ReactNode, useState } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import { ChevronsRightIcon, Pressable } from '@leather.io/ui';

// Pressable without its hover/focus halo (it bleeds 12px past the element):
// the canvas controls draw their own hover and focus ring.
export const plainPressable = {
  _before: { display: 'none' },
  _focusVisible: { outline: 'focus', outlineOffset: '2px' },
} as const;

// Rail open/closed survives reloads (not in the URL: it's the reviewer's
// workspace, not part of what a link shows).
export function useRailOpen(key: string) {
  const storageKey = `leather.exploration.${key}-rail`;
  // The canvas renders client-only (WhenClient), so storage is readable here.
  const [open, setOpen] = useState(() => {
    try {
      return window.localStorage.getItem(storageKey) !== 'closed';
    } catch {
      return true;
    }
  });
  function set(next: boolean) {
    setOpen(next);
    try {
      window.localStorage.setItem(storageKey, next ? 'open' : 'closed');
    } catch {
      // Storage unavailable: the choice lasts until reload.
    }
  }
  return [open, set] as const;
}

interface RailProps {
  label: string;
  open: boolean;
  width: number;
  shortcut: string;
  onToggle(): void;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  as?: 'nav' | 'aside';
}

// Collapsed, a rail is a thin strip that holds its toggle.
const collapsedWidth = 30;
const toggleSize = 22;

// A left-hand rail. Its collapse control sits on its right edge, half over the
// border, so it never pushes a title in; both rails do the same.
export function Rail({
  label,
  open,
  width,
  shortcut,
  onToggle,
  header,
  footer,
  children,
  as = 'nav',
}: RailProps) {
  return (
    <Flex
      as={as}
      aria-label={label}
      direction="column"
      position="sticky"
      top="0"
      height="100vh"
      flexShrink={0}
      // The first rail's toggle overlaps the second rail's edge.
      zIndex={as === 'nav' ? 3 : 2}
      style={{ width: open ? width : collapsedWidth }}
      borderRightWidth={1}
      borderColor="ink.border-default"
      bg="ink.background-primary"
    >
      <RailToggle label={label} open={open} shortcut={shortcut} onToggle={onToggle} />
      {open ? (
        <>
          {header ? (
            <Box px="space.04" pt="space.04" pb="space.03">
              {header}
            </Box>
          ) : null}
          <Box flex="1" overflowY="auto" minHeight="0">
            {children}
          </Box>
          {footer ? (
            <Box
              borderTopWidth={1}
              borderTopStyle="solid"
              borderColor="ink.border-default"
              px="space.04"
              py="space.03"
            >
              {footer}
            </Box>
          ) : null}
        </>
      ) : null}
    </Flex>
  );
}

interface RailToggleProps {
  label: string;
  open: boolean;
  shortcut: string;
  onToggle(): void;
}

function RailToggle({ label, open, shortcut, onToggle }: RailToggleProps) {
  const action = `${open ? 'Hide' : 'Show'} ${label.toLowerCase()}`;
  return (
    <Pressable
      {...plainPressable}
      type="button"
      aria-label={action}
      aria-expanded={open}
      title={`${action} (${shortcut})`}
      onClick={onToggle}
      position="absolute"
      zIndex={3}
      display="flex"
      alignItems="center"
      justifyContent="center"
      // Same spot open or collapsed: half over the right border, so it never
      // moves when the rail does.
      style={{
        width: toggleSize,
        height: toggleSize,
        top: 16,
        right: -toggleSize / 2,
      }}
      borderRadius="round"
      borderWidth={1}
      borderColor="ink.border-default"
      bg="ink.background-primary"
      color="ink.text-subdued"
      cursor="pointer"
      _hover={{ color: 'ink.text-primary', bg: 'ink.component-background-hover' }}
      _focusVisible={{ outline: 'focus', outlineOffset: '2px' }}
    >
      {/* The chevrons point the way the rail will move. */}
      <Box lineHeight={0} transform={open ? 'rotate(180deg)' : undefined}>
        <ChevronsRightIcon variant="small" />
      </Box>
    </Pressable>
  );
}

export function RailHeading({ children }: { children: ReactNode }) {
  return (
    <styled.h2 textStyle="label.03" color="ink.text-secondary" px="space.04" pb="space.02">
      {children}
    </styled.h2>
  );
}

interface RailItemProps {
  selected: boolean;
  onSelect(): void;
  leading?: ReactNode;
  title: ReactNode;
  caption?: ReactNode;
  // Stays in the tab order but reads as a quiet secondary entry.
  muted?: boolean;
  // Tooltip, e.g. a caption only shown while selected.
  hint?: string;
  'data-item'?: string;
}

// One row of a rail list: a real button, current one marked with aria-current.
export function RailItem({
  selected,
  onSelect,
  leading,
  title,
  caption,
  muted,
  hint,
  ...rest
}: RailItemProps) {
  return (
    <Pressable
      {...plainPressable}
      type="button"
      aria-current={selected ? 'true' : undefined}
      onClick={onSelect}
      title={hint}
      data-rail-item={rest['data-item']}
      display="flex"
      gap="space.02"
      alignItems="flex-start"
      width="100%"
      textAlign="left"
      px="space.03"
      py="space.02"
      borderRadius="xs"
      borderLeftWidth={2}
      borderColor={selected ? 'ink.text-primary' : 'transparent'}
      bg={selected ? 'ink.component-background-hover' : 'transparent'}
      color={selected || !muted ? 'ink.text-primary' : 'ink.text-secondary'}
      cursor="pointer"
      _hover={{ bg: 'ink.component-background-hover' }}
      _focusVisible={{ outline: 'focus', outlineOffset: '-2px' }}
    >
      {leading ? (
        <styled.span
          textStyle="caption.02"
          color="ink.text-subdued"
          minWidth="16px"
          pt="1px"
          flexShrink={0}
        >
          {leading}
        </styled.span>
      ) : null}
      <Stack gap="0" minWidth="0" flex="1">
        <styled.span textStyle="label.03" color="inherit">
          {title}
        </styled.span>
        {caption ? (
          <styled.span
            textStyle="caption.02"
            color="ink.text-subdued"
            lineClamp={2}
            overflow="hidden"
          >
            {caption}
          </styled.span>
        ) : null}
      </Stack>
    </Pressable>
  );
}

interface ChoiceProps<T extends string> {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  disabled?: boolean;
  hint?: string;
  onChange(value: T): void;
}

// A segmented choice: a labelled radio group of equal-width buttons, label on
// the left so the rail's controls stay one row each.
export function Choice<T extends string>({
  label,
  options,
  labels,
  value,
  disabled,
  hint,
  onChange,
}: ChoiceProps<T>) {
  return (
    <Flex
      role="radiogroup"
      aria-label={hint ? `${label} (${hint})` : label}
      aria-disabled={disabled}
      alignItems="center"
      gap="space.02"
      title={hint}
    >
      <styled.span textStyle="caption.02" color="ink.text-secondary" width="44px" flexShrink={0}>
        {label}
      </styled.span>
      <Flex flex="1" p="2px" gap="2px" borderRadius="xs" bg="ink.component-background-default">
        {options.map(option => {
          const checked = option === value;
          return (
            <Pressable
              {...plainPressable}
              key={option}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => onChange(option)}
              flex="1"
              minWidth="0"
              justifyContent="center"
              px="space.01"
              py="2px"
              textStyle="label.03"
              whiteSpace="nowrap"
              borderRadius="xs"
              bg={checked ? 'ink.background-primary' : 'transparent'}
              color={checked ? 'ink.text-primary' : 'ink.text-secondary'}
              boxShadow={checked ? '0 1px 2px rgba(0, 0, 0, 0.12)' : undefined}
              cursor="pointer"
              _hover={{ color: 'ink.text-primary' }}
              _disabled={{ opacity: 0.45, cursor: 'default' }}
              _focusVisible={{ outline: 'focus', outlineOffset: '-2px' }}
            >
              {labels[option]}
            </Pressable>
          );
        })}
      </Flex>
    </Flex>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  shortcut?: string;
  onChange(checked: boolean): void;
}

// A labelled switch (role="switch").
export function Toggle({ label, checked, disabled, shortcut, onChange }: ToggleProps) {
  return (
    <Pressable
      {...plainPressable}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="space.02"
      width="100%"
      py="space.01"
      bg="transparent"
      textAlign="left"
      cursor="pointer"
      _disabled={{ opacity: 0.45, cursor: 'default' }}
      _focusVisible={{ outline: 'focus', outlineOffset: '2px' }}
      borderRadius="xs"
    >
      <HStack gap="space.02">
        <styled.span textStyle="label.03" color="ink.text-primary">
          {label}
        </styled.span>
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </HStack>
      <Box
        aria-hidden
        position="relative"
        width="28px"
        height="16px"
        borderRadius="round"
        flexShrink={0}
        borderWidth={1}
        borderColor={checked ? 'ink.action-primary-default' : 'ink.border-default'}
        bg={checked ? 'ink.action-primary-default' : 'ink.component-background-pressed'}
        transition="background 120ms ease"
      >
        <Box
          position="absolute"
          top="1px"
          width="12px"
          height="12px"
          borderRadius="round"
          bg="ink.background-primary"
          transition="left 120ms ease"
          style={{ left: checked ? 13 : 1 }}
        />
      </Box>
    </Pressable>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <styled.kbd
      textStyle="caption.02"
      color="ink.text-subdued"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="xs"
      px="4px"
      minWidth="18px"
      textAlign="center"
      lineHeight="16px"
      fontFamily="inherit"
    >
      {children}
    </styled.kbd>
  );
}
