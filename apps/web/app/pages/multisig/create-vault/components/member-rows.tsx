import { type ChangeEvent } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { Button, PlusIcon } from '@leather.io/ui';

import { myWalletAddress } from '../../data/dummy-multisig-data';
import type { Chain } from '../../data/multisig-types';

export interface MemberDraft {
  addr: string;
  name: string;
  isMe?: boolean;
}

interface MemberRowsProps {
  chain: Chain;
  members: MemberDraft[];
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

export function MemberRows({ chain, members, onChange }: MemberRowsProps) {
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
      {members.map((member, index) => (
        <Flex key={index} gap="space.02" alignItems="center">
          <styled.input
            {...inputStyles}
            flex={1}
            fontFamily="firaCode"
            fontSize="13px"
            readOnly={member.isMe}
            placeholder={member.isMe ? 'Your wallet address' : placeholder}
            value={member.isMe ? myWalletAddress[chain] : member.addr}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              !member.isMe && update(index, { addr: e.target.value })
            }
          />
          <styled.input
            {...inputStyles}
            width="140px"
            placeholder={member.isMe ? 'My name' : 'Name (optional)'}
            value={member.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update(index, { name: e.target.value })}
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
      ))}
      <Button
        variant="ghost"
        onClick={add}
        alignSelf="flex-start"
        iconStart={<PlusIcon variant="small" />}
      >
        Add member
      </Button>
    </Flex>
  );
}
