import { useState } from 'react';

import type { Meta } from '@storybook/react';
import { Box, Flex } from 'leather-styles/jsx';

import { Button } from '../button/button.web';
import { SheetHeader } from './components/sheet-header.web';
import { Sheet as Component } from './sheet.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Sheet',
  parameters: {
    docs: {
      description: {
        component: 'The Sheet component is used to display a modal/dialog sheet.',
      },
    },
  },
};

export default meta;

export function Sheet() {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <>
      <Button onClick={() => setIsShowing(!isShowing)}>Open</Button>
      <Component
        header={<SheetHeader title="Leather" />}
        isShowing={isShowing}
        onClose={() => setIsShowing(false)}
      >
        <Box textAlign="center" height="60vh">
          Let's start talk sheet.
        </Box>
      </Component>
    </>
  );
}

export function SheetWithFooter() {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <>
      <Button onClick={() => setIsShowing(!isShowing)}>Open</Button>
      <Component
        header={<SheetHeader title="Send" />}
        isShowing={isShowing}
        onClose={() => setIsShowing(false)}
        footer={
          <Button fullWidth onClick={() => setIsShowing(false)}>
            Close
          </Button>
        }
      >
        <Box textAlign="center" height="60vh">
          Let's talk sheet.
        </Box>
      </Component>
    </>
  );
}

export function SheetWithButtonsFooter() {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <>
      <Button onClick={() => setIsShowing(!isShowing)}>Open</Button>
      <Component
        header={<SheetHeader title="Send" />}
        isShowing={isShowing}
        onClose={() => setIsShowing(false)}
        footer={
          <Flex flexDirection="row" gap="space.04" width="100%">
            <Button flexGrow={1} variant="outline" onClick={() => setIsShowing(false)}>
              Cancel
            </Button>
            <Button flexGrow={1} onClick={() => setIsShowing(false)}>
              Send
            </Button>
          </Flex>
        }
      >
        <Box textAlign="center" height="60vh">
          Let's talk sheet.
        </Box>
      </Component>
    </>
  );
}
