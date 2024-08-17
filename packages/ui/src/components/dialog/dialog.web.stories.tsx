import { useState } from 'react';

import type { Meta } from '@storybook/react';
import { Box, Flex } from 'leather-styles/jsx';

import { Button } from '../button/button.web';
import { DialogHeader } from './dialog-header.web';
import { Dialog as Component } from './dialog.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Dialog',
};

export default meta;

export function Dialog() {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <>
      <Button onClick={() => setIsShowing(!isShowing)}>Open</Button>
      <Component
        header={<DialogHeader title="Leather" />}
        isShowing={isShowing}
        onClose={() => setIsShowing(false)}
      >
        <Box textAlign="center" height="60vh">
          Let's start a dialogue.
        </Box>
      </Component>
    </>
  );
}

export function DialogWithFooter() {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <>
      <Button onClick={() => setIsShowing(!isShowing)}>Open</Button>
      <Component
        header={<DialogHeader title="Send" />}
        isShowing={isShowing}
        onClose={() => setIsShowing(false)}
        footer={
          <Button fullWidth onClick={() => setIsShowing(false)}>
            Close
          </Button>
        }
      >
        <Box textAlign="center" height="60vh">
          Let's start a dialogue.
        </Box>
      </Component>
    </>
  );
}

export function DialogWithButtonsFooter() {
  const [isShowing, setIsShowing] = useState(false);
  return (
    <>
      <Button onClick={() => setIsShowing(!isShowing)}>Open</Button>
      <Component
        header={<DialogHeader title="Send" />}
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
          Let's start a dialogue.
        </Box>
      </Component>
    </>
  );
}
