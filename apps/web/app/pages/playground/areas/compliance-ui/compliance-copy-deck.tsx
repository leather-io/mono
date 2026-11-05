import { Box, Grid, Stack, styled } from 'leather-styles/jsx';

import {
  complianceActionCopy,
  counterpartyRefusedCopy,
  keyBackupCopy,
  lockoutCopy,
  mailDrafts,
  multisigRefusedCopy,
  onboardingCopy,
  recipientRefusedCopy,
  unavailableCopy,
  whyLockedCopy,
} from '../compliance-shared/compliance-content';

interface CopyEntry {
  key: string;
  value: string;
}

interface CopyGroup {
  screen: string;
  note?: string;
  entries: CopyEntry[];
}

function entriesOf(prefix: string, copy: Record<string, string>) {
  return Object.entries(copy).map(([key, value]) => ({ key: `${prefix}.${key}`, value }));
}

function mailEntries(prefix: string, draft: (typeof mailDrafts)['dispute']) {
  return [
    { key: `${prefix}.to`, value: draft.to },
    { key: `${prefix}.subject`, value: draft.subject },
    { key: `${prefix}.body`, value: draft.body },
  ];
}

// Every user-facing string in compliance-content.ts, grouped by the screen it appears on.
const copyGroups: CopyGroup[] = [
  {
    screen: 'Lockout',
    note: 'Extension popup, tab, request window and mobile.',
    entries: entriesOf('lockoutCopy', lockoutCopy),
  },
  {
    screen: 'Why Leather is locked',
    note: 'One backup link per software wallet created in Leather. Footer: lockoutCopy.disputeCta.',
    entries: [
      { key: 'whyLockedCopy.title', value: whyLockedCopy.title },
      ...whyLockedCopy.paragraphs.map((value, index) => ({
        key: `whyLockedCopy.paragraphs[${index}]`,
        value,
      })),
      {
        key: 'whyLockedCopy.backupLink(walletName)',
        value: whyLockedCopy.backupLink('<wallet name>'),
      },
      { key: 'whyLockedCopy.backupNote', value: whyLockedCopy.backupNote },
    ],
  },
  {
    screen: 'Send review · recipient flagged',
    note: 'Callout replaces the amount. Confirm becomes complianceActionCopy.close.',
    entries: entriesOf('recipientRefusedCopy', recipientRefusedCopy),
  },
  {
    screen: 'Multisig review · member flagged',
    note: 'Propose becomes complianceActionCopy.close.',
    entries: entriesOf('multisigRefusedCopy', multisigRefusedCopy),
  },
  {
    screen: 'dApp approval · counterparty flagged',
    note: 'Callout above the details. Only complianceActionCopy.close.',
    entries: entriesOf('counterpartyRefusedCopy', counterpartyRefusedCopy),
  },
  {
    screen: 'No answer · send review and dApp approval',
    note: '“contact support” is a mailto: link (support draft below).',
    entries: [
      ...entriesOf('unavailableCopy', unavailableCopy),
      {
        key: 'Rendered',
        value: `${unavailableCopy.lead}${unavailableCopy.linkLabel}${unavailableCopy.trail}`,
      },
    ],
  },
  {
    screen: 'Footer actions',
    note: 'Replace Confirm / Propose / Approve on the refusal and no-answer states.',
    entries: entriesOf('complianceActionCopy', complianceActionCopy),
  },
  {
    screen: 'Dispute email (mailto:)',
    note: 'From “Dispute this”. Diagnostics and reference ID are filled in by Leather.',
    entries: mailEntries('mailDrafts.dispute', mailDrafts.dispute),
  },
  {
    screen: 'Support email (mailto:)',
    note: 'From “contact support” on the no-answer notice.',
    entries: mailEntries('mailDrafts.support', mailDrafts.support),
  },
  {
    screen: 'Key backup · demo mock',
    note: 'Not new UI: ships as the existing View Secret Key flow and its copy. Listed because the demo uses it.',
    entries: entriesOf('keyBackupCopy', keyBackupCopy),
  },
  {
    screen: 'Onboarding · demo mock',
    note: 'Existing onboarding copy, mocked for the walkthrough. Not new.',
    entries: [
      { key: 'onboardingCopy.tagline', value: onboardingCopy.tagline.join(' ') },
      ...entriesOf('onboardingCopy', {
        subheader: onboardingCopy.subheader,
        signInTitle: onboardingCopy.signInTitle,
        signInDescription: onboardingCopy.signInDescription,
        passwordTitle: onboardingCopy.passwordTitle,
        passwordDescription: onboardingCopy.passwordDescription,
      }),
    ],
  },
];

export function CopyDeck() {
  return (
    <Grid
      gridTemplateColumns="repeat(auto-fill, minmax(440px, 1fr))"
      gap="space.04"
      data-testid="compliance-ui-copy-deck"
    >
      {copyGroups.map(group => (
        <Stack
          key={group.screen}
          gap="space.03"
          p="space.05"
          bg="ink.background-primary"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="sm"
        >
          <Stack gap="space.01">
            <styled.h3 textStyle="heading.05">{group.screen}</styled.h3>
            {group.note ? (
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                {group.note}
              </styled.p>
            ) : null}
          </Stack>
          <styled.dl display="flex" flexDirection="column" gap="space.03">
            {group.entries.map(entry => (
              <Box key={entry.key}>
                <styled.dt textStyle="code" color="ink.text-subdued">
                  {entry.key}
                </styled.dt>
                <styled.dd textStyle="body.02" whiteSpace="pre-wrap" userSelect="text">
                  {entry.value}
                </styled.dd>
              </Box>
            ))}
          </styled.dl>
        </Stack>
      ))}
    </Grid>
  );
}
