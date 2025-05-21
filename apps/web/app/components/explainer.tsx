import { ReactElement, ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Grid, HTMLStyledProps, VStack, styled } from 'leather-styles/jsx';
import { PostValueHoverCard } from './post-value-hover-card';
import { PostLabelHoverCard } from './post-label-hover-card';

// This is some pretty funky border code I am not a fan of, but didn't find an
// easier way to handle the conditional border for the breakpoints
const gridBorders = css({
  '& > .earn-step:not(:last-child)': {
    borderRight: [null, null, 'default'],
  },
  '& > .earn-step:first-child': {
    borderRight: ['default', 'default', null],
    borderBottom: ['default', 'default', 'unset'],
  },
  '& > .earn-step:nth-child(2)': {
    borderBottom: ['default', 'default', 'unset'],
  },
  '& > .earn-step:nth-child(3)': {
    borderRight: ['default', 'default', null],
  },
});

interface ExplainerProps extends HTMLStyledProps<'section'> {
  children: ReactElement[];
}
export function Explainer({ children, ...props }: ExplainerProps) {
  return (
    <styled.section border="default" borderRadius="sm" {...props}>
      <Grid
        className={gridBorders}
        gap={0}
        gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
      >
        {children}
      </Grid>
    </styled.section>
  );
}

interface EarnInstructionStepProps {
  index: number;
  title: ReactNode;
  description: string;
  img?: ReactElement;
}

export function ExplainerStep({ index, title, description, img }: EarnInstructionStepProps) {
  return (
    <Flex
      flexDir="column"
      p="space.05"
      className="earn-step"
      justifyContent={['space-between', null, 'start']}
    >
      <VStack gap="space.02" alignItems="left" justifyContent="space-between" height="100%">
        <VStack
          gap="space.02"
          flexDirection={['row', null, 'column']}
          justifyContent="space-between"
          alignItems={['center', null, 'start']}
        >
          <styled.span textStyle="heading.05" color="ink.text-non-interactive">
            0{index + 1}
          </styled.span>
          {img ?? <Box width="32px" height="32px" />}
        </VStack>
        <styled.h3 mt="space.02" textStyle="label.01">
          {title}
        </styled.h3>
      </VStack>
      <styled.p color="black" textStyle="caption.01" fontSize="13px">
        {String(description || '')}
      </styled.p>
    </Flex>
  );
}

Explainer.Step = ExplainerStep;
