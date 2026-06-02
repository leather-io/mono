import { useState } from 'react';

import { Box, Flex, Grid, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { AvatarSq } from '../components/avatar-sq';
import { useMultisigToast } from '../components/multisig-toast';
import { TextField } from '../components/text-field';
import type { Vault } from '../data/multisig-types';
import { accountIconUrl, accountIcons } from '../multisig-tokens';
import { useMultisigActions } from '../store/use-multisig';

interface CreateAccountModalProps {
  vault: Vault;
  isShowing: boolean;
  onClose(): void;
}

export function CreateAccountModal({ vault, isShowing, onClose }: CreateAccountModalProps) {
  const { addAccount } = useMultisigActions();
  const { showToast } = useMultisigToast();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('piggybank');
  const [threshold, setThreshold] = useState<number | null>(null);

  const total = vault.members.length;
  const canCreate = name.trim() !== '' && threshold !== null;

  function submit() {
    if (name.trim() === '' || threshold === null) return;
    addAccount({ vaultId: vault.id, name: name.trim(), threshold, icon });
    showToast(`Account “${name.trim()}” created`);
    onClose();
  }

  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      header={<SheetHeader title="Create vault account" />}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" disabled={!canCreate} onClick={submit}>
            Create vault account
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="space.05" px="space.05" pb="space.05">
        <styled.p textStyle="body.02" color="ink.text-subdued">
          An account is a shared on-chain address with its own signing threshold. Use multiple
          accounts for different purposes — treasury, day-to-day, ops.
        </styled.p>

        <Flex alignItems="flex-end" gap="space.03">
          <AvatarSq
            chain={vault.chain}
            icon={icon}
            themeId={vault.theme}
            size="lg"
            withChainBadge={false}
          />
          <Box flex={1}>
            <TextField
              label="Account name"
              placeholder="Account name"
              value={name}
              onChange={setName}
            />
          </Box>
        </Flex>

        <Box>
          <styled.div textStyle="label.03" color="ink.text-subdued" mb="space.02">
            Icon
          </styled.div>
          <Grid gridTemplateColumns="repeat(7, 1fr)" gap="space.02">
            {accountIcons.map(id => {
              const selected = id === icon;
              return (
                <styled.button
                  key={id}
                  type="button"
                  onClick={() => setIcon(id)}
                  aria-label={id}
                  aria-pressed={selected}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  p="space.02"
                  borderRadius="sm"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor={selected ? 'ink.action-primary-default' : 'ink.border-default'}
                  bg={selected ? 'ink.component-background-hover' : 'transparent'}
                >
                  <Box
                    width="18px"
                    height="18px"
                    bg="ink.text-primary"
                    style={{
                      WebkitMaskImage: `url(${accountIconUrl(id)})`,
                      maskImage: `url(${accountIconUrl(id)})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                    }}
                  />
                </styled.button>
              );
            })}
          </Grid>
        </Box>

        <Box>
          <styled.div textStyle="label.03" color="ink.text-subdued" mb="space.01">
            Signing threshold
          </styled.div>
          <styled.div textStyle="caption.01" color="ink.text-subdued" mb="space.02">
            How many of {total} members must approve before a transaction can be broadcast?
          </styled.div>
          <Flex gap="space.02" flexWrap="wrap">
            {Array.from({ length: total }, (_, i) => i + 1).map(n => {
              const selected = threshold === n;
              return (
                <styled.button
                  key={n}
                  type="button"
                  onClick={() => setThreshold(n)}
                  aria-pressed={selected}
                  cursor="pointer"
                  width="44px"
                  height="44px"
                  borderRadius="sm"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor={selected ? 'ink.action-primary-default' : 'ink.border-default'}
                  bg={selected ? 'ink.action-primary-default' : 'transparent'}
                  color={selected ? 'ink.background-primary' : 'ink.text-primary'}
                  textStyle="label.01"
                >
                  {n}
                </styled.button>
              );
            })}
          </Flex>
        </Box>

        {threshold !== null && (
          <Box
            p="space.04"
            borderRadius="md"
            bg="yellow.background-primary"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="yellow.border"
          >
            <styled.span textStyle="caption.01" color="yellow.text-primary">
              Any {threshold} of {total} members can approve transactions. A 1-of-{total} threshold
              means any single member can transact alone.
            </styled.span>
          </Box>
        )}
      </Flex>
    </Sheet>
  );
}
