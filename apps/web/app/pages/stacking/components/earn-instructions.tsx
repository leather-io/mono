import type { ReactElement } from 'react';

import { css } from 'leather-styles/css';
import { Flex, Grid, type HTMLStyledProps, VStack, styled } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';

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

// interface EarnInstructionsProps extends HTMLStyledProps<'section'> {}
export function EarnInstructions(props: HTMLStyledProps<'section'>) {
  return (
    <styled.section border="default" borderRadius="sm" {...props}>
      <Grid
        className={gridBorders}
        gap={0}
        gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
      >
        <EarnInstructionStep
          index={0}
          title="Own STX"
          description="Get or hold STX in your wallet, ready to stack."
          img={<DummyIcon />}
        />
        <EarnInstructionStep
          index={1}
          title="Choose a provider"
          description="Pick a protocol from the table below"
          img={<DummyIcon />}
        />
        <EarnInstructionStep
          index={2}
          title="Lock STX"
          description="Delegate and lock your STX into the chosen pool"
          img={<DummyIcon />}
        />
        <EarnInstructionStep
          index={3}
          title="Begin earning"
          description="Receive regular rewards without lifting a finger"
          img={<DummyIcon />}
        />
      </Grid>
    </styled.section>
  );
}

interface EarnInstructionStepProps {
  index: number;
  title: string;
  description: string;
  img: ReactElement;
}
export function EarnInstructionStep({ index, title, description, img }: EarnInstructionStepProps) {
  return (
    <Flex flexDir="column" p="space.05" className="earn-step">
      <VStack gap="space.02" alignItems="left">
        <styled.span textStyle="heading.05" color="ink.text-non-interactive">
          0{index + 1}
        </styled.span>
        {img}
        <styled.h3 textStyle="label.01">{title}</styled.h3>
      </VStack>
      <styled.p textStyle="caption.01" fontSize="13px">
        {description}
      </styled.p>
    </Flex>
  );
}
