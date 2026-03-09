import { ReactNode } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Flex, styled } from 'leather-styles/jsx';
import { isString } from 'remeda';

import { Button, Hr, HrProps, SettingsGearIcon } from '@leather.io/ui';

import { HasChildren } from '@app/common/has-children';

const layoutTransition = { type: 'spring' as const, mass: 2, stiffness: 700, damping: 200 };
const enteringTransition = { duration: 0.24, delay: 0.24, ease: [0.25, 0.46, 0.45, 0.94] as const };

interface SwapReviewDetailsProps extends HasChildren {
  isRefetching: boolean;
}

export function SwapReviewDetails({ children, isRefetching }: SwapReviewDetailsProps) {
  return (
    <Flex
      direction="column"
      px="space.05"
      gap="space.01"
      opacity={isRefetching ? 0.5 : 1}
      transition="opacity 200ms ease"
    >
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </Flex>
  );
}

interface SwapReviewDetailRowProps {
  label: ReactNode;
  value: ReactNode;
  info?: ReactNode;
}

export function SwapReviewDetailRow({ label, value, info }: SwapReviewDetailRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ layout: layoutTransition, opacity: enteringTransition }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 40 }}
    >
      <Flex alignItems="center">
        <TextOrNode color="ink.text-subdued">{label}</TextOrNode>
        {info}
      </Flex>
      <TextOrNode>{value}</TextOrNode>
    </motion.div>
  );
}

interface SwapReviewDetailToggleProps {
  label: string;
  onClick(): void;
}

export function SwapReviewDetailToggle({ label, onClick }: SwapReviewDetailToggleProps) {
  return (
    <Button
      size="sm"
      borderRadius="md"
      variant="outline"
      onClick={onClick}
      position="relative"
      right={-2}
      iconStart={<SettingsGearIcon variant="small" />}
    >
      {label}
    </Button>
  );
}

export function SwapReviewDivider(props: HrProps) {
  return (
    <motion.div layout transition={{ layout: layoutTransition }}>
      <Hr my="space.01" {...props} />
    </motion.div>
  );
}

interface TextOrNodeProps {
  children: ReactNode;
  color?: string;
}

function TextOrNode({ children, color }: TextOrNodeProps) {
  return isString(children) ? (
    <styled.span textStyle="label.02" color={color}>
      {children}
    </styled.span>
  ) : (
    children
  );
}
