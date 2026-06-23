import { ReactNode } from 'react';

import { motion } from 'framer-motion';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { Sheet } from '@leather.io/ui';

import { FeatureIntroducerHeader } from './feature-introducer-header';

interface FeatureIntroducerProps {
  children: ReactNode;
  onClose?(): void;
}

function FeatureIntroducerRoot({ children, onClose }: FeatureIntroducerProps) {
  return (
    <Sheet isShowing={true} onClose={onClose} variant="dialog" wrapChildren={false}>
      <FeatureIntroducerHeader onClose={onClose} />
      <Flex direction="column" gap="space.08" flexGrow="1" overflowY="auto" width="100%">
        {children}
      </Flex>
    </Sheet>
  );
}

interface IllustrationProps {
  children: ReactNode;
}

function Illustration({ children }: IllustrationProps) {
  return (
    <Box width="100%" flexShrink="0">
      {children}
    </Box>
  );
}

interface LabelProps {
  children: ReactNode;
}

const MotionStyledP = motion.create(styled.p);

function Label({ children }: LabelProps) {
  return (
    <MotionStyledP
      textStyle="heading.05"
      color="ink.text-subdued"
      width="100%"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.06 }}
    >
      {children}
    </MotionStyledP>
  );
}

interface TitleProps {
  children: ReactNode;
}

const MotionStyledH2 = motion.create(styled.h2);

function Title({ children }: TitleProps) {
  return (
    <MotionStyledH2
      textStyle="heading.03"
      color="ink.text-primary"
      width="100%"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.55 }}
    >
      {children}
    </MotionStyledH2>
  );
}

interface DescriptionProps {
  children: ReactNode;
}

function Description({ children }: DescriptionProps) {
  return (
    <MotionStyledP
      textStyle="label.02"
      color="ink.text-primary"
      width="100%"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
    >
      {children}
    </MotionStyledP>
  );
}

interface ContentProps {
  children: ReactNode;
}

function Content({ children }: ContentProps) {
  return (
    <Flex direction="column" gap="space.03" px="space.06" width="100%">
      {children}
    </Flex>
  );
}

interface ActionsProps {
  children: ReactNode;
}

const MotionFlex = motion.create(Flex);

function Actions({ children }: ActionsProps) {
  return (
    <MotionFlex
      direction="column"
      gap="space.04"
      px="space.06"
      pb="space.06"
      pt="space.04"
      width="100%"
      bg="ink.background-primary"
      position="sticky"
      bottom={0}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.65 }}
    >
      {children}
    </MotionFlex>
  );
}

export const FeatureIntroducer = {
  Root: FeatureIntroducerRoot,
  Illustration,
  Content,
  Label,
  Title,
  Description,
  Actions,
};
