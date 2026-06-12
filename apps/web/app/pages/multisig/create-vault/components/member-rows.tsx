import { type ChangeEvent } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button, CheckmarkIcon, PlusIcon } from '@leather.io/ui';

import type { Chain } from '../../data/multisig-types';

export interface MemberDraft {
  addr: string;
  name: string;
  isMe?: boolean;
}

export interface MemberFieldStatus {
  state: 'empty' | 'valid' | 'invalid';
  error?: string;
}

interface MemberRowsProps {
  chain: Chain;
  members: MemberDraft[];
  myAddress?: string;
  statuses: MemberFieldStatus[];
  onChange(members: MemberDraft[]): void;
}

const inputStyles = {
  px: 'space.03',
  py: 'space.03',
  borderRadius: 'sm',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'ink.border-default',
  bg: 'ink.background-primary',
  textStyle: 'body.02',
  _focusVisible: { outline: 'none', borderColor: 'ink.action-primary-default' },
} as const;

function borderColorForStatus(state: MemberFieldStatus['state']) {
  if (state === 'invalid') return 'red.action-primary-default';
  if (state === 'valid') return 'green.border';
  return 'ink.border-default';
}

export function MemberRows({ chain, members, myAddress, statuses, onChange }: MemberRowsProps) {
  const placeholder = chain === 'btc' ? 'bc1q… address' : 'BNS or SP… address';

  function update(index: number, patch: Partial<MemberDraft>) {
    onChange(members.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }
  function add() {
    onChange([...members, { addr: '', name: '' }]);
  }
  function remove(index: number) {
    onChange(members.filter((_, i) => i !== index));
  }

  return (
    <Flex direction="column" gap="space.02">
      {members.map((member, index) => {
        const status = statuses[index] ?? { state: 'empty' };
        return (
          <Flex key={index} direction="column" gap="space.01">
            <Flex gap="space.02" alignItems="center">
              <Box position="relative" flex={1}>
                <styled.input
                  {...inputStyles}
                  width="100%"
                  textStyle="code"
                  borderColor={borderColorForStatus(status.state)}
                  pr={status.state === 'valid' ? 'space.07' : 'space.03'}
                  readOnly={member.isMe}
                  placeholder={member.isMe ? 'Your wallet address' : placeholder}
                  value={member.isMe ? (myAddress ?? '') : member.addr}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    !member.isMe && update(index, { addr: e.target.value })
                  }
                />
                {status.state === 'valid' && (
                  <Box
                    position="absolute"
                    right="space.03"
                    top="50%"
                    transform="translateY(-50%)"
                    lineHeight="0"
                  >
                    <CheckmarkIcon variant="small" color="green.text-secondary" />
                  </Box>
                )}
              </Box>
              <styled.input
                {...inputStyles}
                width="140px"
                placeholder={member.isMe ? 'My name' : 'Name (optional)'}
                value={member.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update(index, { name: e.target.value })
                }
              />
              <styled.button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove member"
                visibility={member.isMe ? 'hidden' : 'visible'}
                cursor="pointer"
                bg="transparent"
                color="ink.text-subdued"
                px="space.02"
                _hover={{ color: 'ink.text-primary' }}
              >
                ✕
              </styled.button>
            </Flex>
            {status.error && (
              <styled.span textStyle="caption.01" color="red.action-primary-default">
                {status.error}
              </styled.span>
            )}
          </Flex>
        );
      })}
      <Button
        variant="ghost"
        size="md"
        onClick={add}
        alignSelf="flex-start"
        iconStart={<PlusIcon variant="small" />}
      >
        Add member
      </Button>
    </Flex>
  );
}
