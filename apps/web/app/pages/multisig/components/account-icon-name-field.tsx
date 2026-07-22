import { useEffect, useRef, useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { ChevronDownIcon } from '@leather.io/ui';

import type { Chain } from '../data/multisig-types';
import { accountIcons } from '../multisig-tokens';
import { AvatarSq } from './avatar-sq';
import { GlyphButton } from './glyph-button';

interface AccountIconNameFieldProps {
  chain: Chain;
  themeId: number;
  name: string;
  icon: string;
  onNameChange(value: string): void;
  onIconChange(value: string): void;
  placeholder?: string;
  inline?: boolean;
}

export function AccountIconNameField({
  chain,
  themeId,
  name,
  icon,
  onNameChange,
  onIconChange,
  placeholder,
  inline = false,
}: AccountIconNameFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inline || !isPickerOpen) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && pickerRef.current && !pickerRef.current.contains(target)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [inline, isPickerOpen]);

  const grid = (
    <Box
      p="space.03"
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
      boxShadow={inline ? undefined : '0px 12px 32px rgba(0, 0, 0, 0.16)'}
      display="grid"
      gridTemplateColumns="repeat(7, 1fr)"
      gap="space.02"
    >
      {accountIcons.map(option => (
        <GlyphButton
          key={option}
          icon={option}
          selected={icon === option}
          onClick={() => {
            onIconChange(option);
            if (!inline) setIsPickerOpen(false);
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box position="relative" ref={inline ? undefined : pickerRef}>
      <Flex
        alignItems="center"
        gap="space.03"
        pl="space.03"
        pr="space.04"
        py="space.03"
        borderRadius="sm"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="ink.border-default"
        bg="ink.background-primary"
      >
        {inline ? (
          <Box flexShrink={0} lineHeight="0">
            <AvatarSq
              chain={chain}
              icon={icon}
              themeId={themeId}
              size="md"
              withChainBadge={false}
            />
          </Box>
        ) : (
          <styled.button
            type="button"
            onClick={() => setIsPickerOpen(open => !open)}
            aria-label="Choose account icon"
            position="relative"
            flexShrink={0}
            lineHeight="0"
            bg="transparent"
            cursor="pointer"
          >
            <AvatarSq
              chain={chain}
              icon={icon}
              themeId={themeId}
              size="md"
              withChainBadge={false}
            />
            <Box
              position="absolute"
              bottom="-2px"
              right="-2px"
              width="20px"
              height="20px"
              borderRadius="round"
              borderWidth="2px"
              borderStyle="solid"
              borderColor="ink.background-primary"
              bg="ink.text-primary"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                display="flex"
                transform={isPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                transition="transform 150ms ease"
              >
                <ChevronDownIcon
                  variant="small"
                  color="ink.background-primary"
                  width={12}
                  height={12}
                />
              </Box>
            </Box>
          </styled.button>
        )}
        <styled.input
          flex={1}
          value={name}
          placeholder={placeholder}
          onChange={event => onNameChange(event.target.value)}
          border="none"
          bg="transparent"
          textStyle="body.02"
          _placeholder={{ color: 'ink.text-subdued' }}
          _focusVisible={{ outline: 'none' }}
        />
      </Flex>
      {inline ? (
        <Box mt="space.03">{grid}</Box>
      ) : (
        isPickerOpen && (
          <Box position="absolute" top="100%" left="0" width="100%" mt="space.02" zIndex={20}>
            {grid}
          </Box>
        )
      )}
    </Box>
  );
}
