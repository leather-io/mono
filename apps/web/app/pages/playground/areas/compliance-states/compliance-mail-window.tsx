import { type ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { PaperPlaneIcon } from '@leather.io/ui';

import { type MailKind, mailDrafts } from '../compliance-shared/compliance-content';

const systemFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';

const trafficLights = [
  { id: 'close', color: '#FF5F57', border: '#E0443E' },
  { id: 'minimize', color: '#FEBC2E', border: '#DEA123' },
  { id: 'zoom', color: '#28C840', border: '#1AAB29' },
];

function HeaderRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Flex
      alignItems="center"
      gap="8px"
      minHeight="36px"
      px="16px"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderColor="#E6E6E6"
    >
      <styled.span color="#8E8E93" fontSize="13px" minWidth="56px" textAlign="right">
        {label}
      </styled.span>
      {children}
    </Flex>
  );
}

interface MailWindowProps {
  kind: MailKind;
  onClose(): void;
}
export function MailWindow({ kind, onClose }: MailWindowProps) {
  const draft = mailDrafts[kind];
  return (
    <Box
      width="520px"
      flexShrink={0}
      bg="#FFFFFF"
      borderRadius="10px"
      overflow="hidden"
      boxShadow="0 24px 64px rgba(0, 0, 0, 0.26), 0 0 0 0.5px rgba(0, 0, 0, 0.24)"
      fontFamily={systemFont}
      color="#1D1D1F"
      animation="fadein 220ms ease-out"
      role="dialog"
      aria-label={draft.subject}
      data-testid="compliance-mail-window"
    >
      <Flex
        alignItems="center"
        height="52px"
        px="16px"
        gap="12px"
        bg="#F6F6F6"
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderColor="#DCDCDC"
      >
        <Flex gap="8px">
          {trafficLights.map(light => (
            <styled.button
              key={light.id}
              type="button"
              aria-label={light.id === 'close' ? 'Close draft' : light.id}
              onClick={light.id === 'close' ? onClose : undefined}
              width="12px"
              height="12px"
              borderRadius="50%"
              cursor={light.id === 'close' ? 'pointer' : 'default'}
              style={{ backgroundColor: light.color, border: `0.5px solid ${light.border}` }}
            />
          ))}
        </Flex>
        <Box color="#8E8E93" ml="8px">
          <PaperPlaneIcon variant="small" />
        </Box>
        <styled.span
          flex={1}
          textAlign="center"
          fontSize="13px"
          fontWeight={600}
          color="#3C3C43"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          pr="72px"
        >
          {draft.subject}
        </styled.span>
      </Flex>
      <HeaderRow label="To:">
        <styled.span
          fontSize="13px"
          px="6px"
          py="1px"
          borderRadius="4px"
          bg="#E8F0FE"
          color="#0A57D0"
        >
          {draft.to}
        </styled.span>
      </HeaderRow>
      <HeaderRow label="Cc:">
        <span />
      </HeaderRow>
      <HeaderRow label="Subject:">
        <styled.span fontSize="13px">{draft.subject}</styled.span>
      </HeaderRow>
      <styled.div
        p="16px"
        minHeight="280px"
        fontSize="13px"
        lineHeight="20px"
        whiteSpace="pre-wrap"
        data-testid="compliance-mail-body"
      >
        {draft.body}
      </styled.div>
    </Box>
  );
}
