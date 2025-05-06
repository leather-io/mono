import { Meta, StoryObj } from '@storybook/react';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { Badge, QuestionCircleIcon } from 'src/exports.web';

import { HoverCard as Component } from './hover-card.web';

const meta: Meta<typeof Component.Root> = {
  component: Component.Root,
  tags: ['autodocs'],
  title: 'Components/HoverCard',
  argTypes: {},
  parameters: {},
  render: ({ children }) => (
    <Flex width="100%" height="220px" alignItems="center" justifyContent="center">
      <Component.Root openDelay={220} defaultOpen>
        <Component.Trigger>Hover me</Component.Trigger>
        <Component.Content>{children}</Component.Content>
      </Component.Root>
    </Flex>
  ),
};

export default meta;

type Story = StoryObj<typeof Component.Root>;

export const HoverCard: Story = {
  args: {
    children: (
      <Box textStyle="body.01" textAlign="center">
        Some hover card content
      </Box>
    ),
  },
};

export const HoverCardTop: Story = {
  name: 'Hover card top, with arrow',
  args: {
    children: <Box>Hover card content opening to the top</Box>,
  },
  render: ({ children }) => (
    <Flex width="100%" height="220px" alignItems="center" justifyContent="center">
      <Component.Root defaultOpen openDelay={220}>
        <Component.Trigger>
          <Badge
            variant="info"
            label="Press me"
            icon={<QuestionCircleIcon color="blue.action-primary-default" variant="small" />}
          />
        </Component.Trigger>
        <Component.Content side="top">
          <Component.Arrow />
          {children}
        </Component.Content>
      </Component.Root>
    </Flex>
  ),
};

export const HoverCardRight: Story = {
  args: {
    children: (
      <Flex flexDir="column">
        <styled.h2 textStyle="heading.05">Header content</styled.h2>
        <styled.p>With some description about what's going on in this neighbourhood</styled.p>
      </Flex>
    ),
  },
  render: ({ children }) => (
    <Flex width="100%" height="220px" alignItems="center" justifyContent="center">
      <Component.Root openDelay={220} defaultOpen>
        <Component.Trigger>Touch me</Component.Trigger>
        <Component.Content side="right">{children}</Component.Content>
      </Component.Root>
    </Flex>
  ),
};

export const HoverCardBottom: Story = {
  args: {
    children: <Box>Hover card content opening to the bottom</Box>,
  },
  render: ({ children }) => (
    <Flex width="100%" height="220px" alignItems="center" justifyContent="center">
      <Component.Root openDelay={220} defaultOpen>
        <Component.Trigger>Feel me</Component.Trigger>
        <Component.Content side="bottom">{children}</Component.Content>
      </Component.Root>
    </Flex>
  ),
};

export const HoverCardLeft: Story = {
  args: {
    children: <Box>Hover card content opening to the left</Box>,
  },
  render: ({ children }) => (
    <Flex width="100%" height="220px" alignItems="center" justifyContent="center">
      <Component.Root openDelay={220} defaultOpen>
        <Component.Trigger>Caress me</Component.Trigger>
        <Component.Content side="left" align="start">
          {children}
        </Component.Content>
      </Component.Root>
    </Flex>
  ),
};
