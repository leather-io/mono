import { type ReactNode, useState } from 'react';

import { Box, Flex, Grid, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, BtcAvatarIcon } from '@leather.io/ui';

import { handshakeOutline } from '../directions/handshake-primitives';
import {
  HandshakeAccountPicker,
  HandshakeAssetRow,
  HandshakeChoice,
  HandshakeDisclosureRow,
  HandshakeFeeRow,
  HandshakeGuarantee,
  HandshakeRecipientRow,
  HandshakeRow,
  HandshakeSwitchRow,
} from '../directions/handshake-rows';
import { HandshakeSection } from '../directions/handshake-section';
import { ApprovalIdentityContextBadge } from '../pattern/approval-identity-context';
import { ApprovalRowAction, ExactAmount } from '../pattern/approval-rows';
import type { ApprovalAccount } from '../pattern/approval-types';
import { useCanvasSettings } from './canvas-settings';

const exampleAccounts: ApprovalAccount[] = [
  {
    name: 'Everyday',
    index: 0,
    address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    icon: 'orange',
    signer: 'software',
  },
  {
    name: 'Savings',
    index: 1,
    address: 'SP3FBR2AGK5R7MC9Z4DT6YV80W8G4JN95H9FJ3Y89',
    icon: 'bank',
    signer: 'ledger',
  },
];

interface PrimitiveExampleProps {
  title: string;
  description: string;
  component: string;
  children: ReactNode;
}

function PrimitiveExample({ title, description, component, children }: PrimitiveExampleProps) {
  return (
    <Stack as="section" gap="space.04" minWidth="0">
      <Stack gap="space.02">
        <styled.h2 textStyle="heading.05">{title}</styled.h2>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          {description}
        </styled.p>
      </Stack>
      <Box
        bg="ink.background-primary"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="lg"
        p="space.04"
        minWidth="0"
      >
        {children}
      </Box>
      <styled.code textStyle="caption.02" color="ink.text-subdued" overflowWrap="anywhere">
        {component}
      </styled.code>
    </Stack>
  );
}

export function PrimitivesView() {
  const { theme } = useCanvasSettings();
  const [accountIndex, setAccountIndex] = useState(0);
  const [feeSpeed, setFeeSpeed] = useState<'standard' | 'fast'>('standard');
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isAdvancedOpen, setAdvancedOpen] = useState(false);
  const [isNotificationOn, setNotificationOn] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(0);
  const account = exampleAccounts[accountIndex];
  if (!account) return null;
  return (
    <Stack
      as="section"
      className={theme === 'dark' ? 'dark' : undefined}
      bg="ink.background-primary"
      color="ink.text-primary"
      py="space.07"
      gap="space.07"
      maxWidth="960px"
      mx="auto"
    >
      <Stack gap="space.03">
        <styled.h1 textStyle="heading.03">Handshake primitives</styled.h1>
        <styled.p textStyle="body.02" color="ink.text-subdued" maxWidth="640px">
          The same components used in the approval forms. Labels sit above values. Outlined
          containers hold facts; filled surfaces offer an action. Try the controls to inspect their
          states, or switch the theme above.
        </styled.p>
      </Stack>
      <Grid columns={{ base: 1, md: 2 }} gap="space.07" alignItems="start">
        <PrimitiveExample
          title="Asset and recipient"
          description="Labels and short source info share a header. Full addresses use the existing code typography token."
          component="HandshakeAssetRow · HandshakeRecipientRow"
        >
          <Stack gap="space.03">
            <Box className={handshakeOutline} p="space.04">
              <HandshakeAssetRow
                icon={<BtcAvatarIcon size="md" />}
                label="You send"
                qualifier="Exactly"
                amount={<ExactAmount value="0.00100000" symbol="BTC" />}
                fiat="$64.20"
                direction="out"
              />
            </Box>
            <Box className={handshakeOutline} p="space.04">
              <HandshakeRecipientRow
                label="Recipient"
                address={<AddressDisplayer address={account.address} />}
                metadata="From app"
              />
            </Box>
          </Stack>
        </PrimitiveExample>
        <PrimitiveExample
          title="Change a value"
          description="Fees and accounts share the Change cue. Compact account addresses keep the first and last four characters. Click to try another value."
          component="HandshakeFeeRow · HandshakeAccountPicker · HandshakeActionCue"
        >
          <Stack gap="space.03">
            <styled.button
              type="button"
              width="100%"
              textAlign="left"
              aria-label={`Change network fee, currently ${feeSpeed}`}
              onClick={() => setFeeSpeed(current => (current === 'standard' ? 'fast' : 'standard'))}
            >
              <HandshakeFeeRow
                label="Network fee"
                amount={feeSpeed === 'standard' ? '0.00001200 BTC' : '0.00001800 BTC'}
                fiat={feeSpeed === 'standard' ? '$0.77' : '$1.16'}
                caption={feeSpeed === 'standard' ? 'Standard (≈30m)' : 'Fast (≈10m)'}
                speed={feeSpeed}
                action={<ApprovalRowAction label="Change" />}
              />
            </styled.button>
            <styled.button
              type="button"
              width="100%"
              textAlign="left"
              aria-label={`Change account, currently ${account.name}`}
              onClick={() => setAccountIndex(current => (current + 1) % exampleAccounts.length)}
            >
              <HandshakeAccountPicker account={account} caption={account.address} />
            </styled.button>
          </Stack>
        </PrimitiveExample>
        <PrimitiveExample
          title="Disclosure"
          description="Filled disclosure controls reveal outlined facts. Open a row or a grouped section."
          component="HandshakeDisclosureRow · HandshakeSection · HandshakeRow"
        >
          <Stack gap="space.03">
            <styled.button
              type="button"
              width="100%"
              textAlign="left"
              aria-expanded={isDetailOpen}
              aria-controls="primitive-request-details"
              onClick={() => setDetailOpen(current => !current)}
            >
              <HandshakeDisclosureRow
                label="Request details"
                caption="Who is asking and what they need"
              />
            </styled.button>
            {isDetailOpen && (
              <Box id="primitive-request-details" className={handshakeOutline} px="space.04">
                <HandshakeRow label="Requesting app" value="app.example.com" />
              </Box>
            )}
            <HandshakeSection
              label="Advanced"
              collapsible
              summary="One detail"
              isOpen={isAdvancedOpen}
              onToggle={() => setAdvancedOpen(current => !current)}
            >
              <HandshakeRow label="Network" value="Bitcoin mainnet" />
            </HandshakeSection>
          </Stack>
        </PrimitiveExample>
        <PrimitiveExample
          title="Choice and switch"
          description="Selection controls share the filled surface. Disabled options use an outline."
          component="HandshakeChoice · HandshakeSwitchRow"
        >
          <Stack gap="space.03">
            <Stack role="radiogroup" aria-label="Example signing account" gap="space.02">
              {exampleAccounts.map((item, index) => (
                <HandshakeChoice
                  key={item.name}
                  label={item.name}
                  caption={item.signer === 'ledger' ? 'Ledger account' : 'Software account'}
                  isSelected={selectedAccount === index}
                  onSelect={() => setSelectedAccount(index)}
                />
              ))}
              <HandshakeChoice
                label="Unavailable account"
                isSelected={false}
                isDisabled
                onSelect={() => undefined}
              />
            </Stack>
            <HandshakeSwitchRow
              switchId="primitive-notifications"
              title="Transaction notifications"
              caption="Notify me when the transaction confirms"
              isChecked={isNotificationOn}
              onCheckedChange={setNotificationOn}
            />
          </Stack>
        </PrimitiveExample>
        <PrimitiveExample
          title="Identity context"
          description="Example states use facts, not a safety score. New is neutral; a lookalike deserves attention."
          component="ApprovalIdentityContextBadge · HandshakeRecipientRow"
        >
          <Stack gap="space.04">
            <HandshakeRecipientRow
              label="Recipient"
              address={<AddressDisplayer address={account.address} />}
              context={{
                status: 'neutral',
                label: 'New recipient',
                description: 'No previous sends to this address.',
              }}
            />
            <HandshakeRecipientRow
              label="Recipient"
              address={<AddressDisplayer address={account.address} />}
              context={{
                status: 'caution',
                label: 'Lookalike',
                description: 'Matches the ends of a known address, but the middle differs.',
              }}
              caption="Same ends as a past recipient, different middle."
            />
            <Flex gap="space.02" flexWrap="wrap">
              <ApprovalIdentityContextBadge
                context={{
                  status: 'clear',
                  label: 'Your account',
                  description: 'Belongs to this Leather wallet.',
                }}
              />
              <ApprovalIdentityContextBadge
                context={{
                  status: 'neutral',
                  label: 'BNS resolved',
                  description: 'A name lookup, not an endorsement.',
                }}
              />
              <ApprovalIdentityContextBadge
                context={{
                  status: 'blocked',
                  label: 'Reported site',
                  description: 'Reported for stealing funds in this example.',
                }}
              />
            </Flex>
          </Stack>
        </PrimitiveExample>
        <PrimitiveExample
          title="Safety notes"
          description="A guarantee is supporting text. A caution has its own notice surface."
          component="HandshakeGuarantee"
        >
          <Stack gap="space.04">
            <HandshakeGuarantee kind="strict" label="Only this amount" isWeak={false}>
              The transaction cannot send more than the amount shown.
            </HandshakeGuarantee>
            <HandshakeGuarantee kind="unrestricted" label="No spending limit" isWeak>
              Review the app and its permissions before approving.
            </HandshakeGuarantee>
          </Stack>
        </PrimitiveExample>
        <PrimitiveExample
          title="Estimated amount"
          description="The header marks an estimate and the value keeps its source nearby."
          component="HandshakeAssetRow · HandshakeLabelRow · HandshakeValueRow"
        >
          <Box className={handshakeOutline} p="space.04">
            <HandshakeAssetRow
              icon={<BtcAvatarIcon size="md" />}
              label="You receive"
              amount="0.00098000 BTC"
              fiat="$62.92"
              direction="in"
              estimateSource="App simulation"
            />
          </Box>
        </PrimitiveExample>
      </Grid>
    </Stack>
  );
}
