import { useRef } from 'react';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button onClick={() => triggerRef.current?.click()}>Open</Button>
      <Component
        onClose={() => closeRef.current?.click()}
        header={<SheetHeader title="Leather" onClose={() => closeRef.current?.click()} />}
        triggerRef={triggerRef}
        closeRef={closeRef}
      >
        <Box textAlign="center" height="60vh">
          Let's start talk sheet.
        </Box>
      </Component>
    </>
  );
}

export function SheetWithFooter() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button onClick={() => triggerRef.current?.click()}>Open</Button>
      <Component
        header={<SheetHeader title="Send" />}
        onClose={() => closeRef.current?.click()}
        triggerRef={triggerRef}
        closeRef={closeRef}
        footer={
          <Button fullWidth onClick={() => closeRef.current?.click()}>
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button onClick={() => triggerRef.current?.click()}>Open</Button>
      <Component
        header={<SheetHeader title="Send" />}
        onClose={() => closeRef.current?.click()}
        triggerRef={triggerRef}
        closeRef={closeRef}
        footer={
          <Flex flexDirection="row" gap="space.04" width="100%">
            <Button flexGrow={1} variant="outline" onClick={() => closeRef.current?.click()}>
              Cancel
            </Button>
            <Button flexGrow={1} onClick={() => closeRef.current?.click()}>
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
