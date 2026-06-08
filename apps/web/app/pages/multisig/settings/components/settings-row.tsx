import { type ReactNode, useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { Switch } from '@leather.io/ui';

interface SettingsRowProps {
  title: string;
  sub?: string;
  defaultOn?: boolean;
  // When provided, replaces the default toggle (e.g. a select control).
  trailing?: ReactNode;
}

export function SettingsRow({ title, sub, defaultOn = false, trailing }: SettingsRowProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.04"
      p="space.04"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-default"
    >
      <Box minWidth={0}>
        <styled.div textStyle="label.02">{title}</styled.div>
        {sub && (
          <styled.div textStyle="caption.01" color="ink.text-subdued">
            {sub}
          </styled.div>
        )}
      </Box>
      {trailing ?? (
        <Switch.Root checked={on} onCheckedChange={setOn}>
          <Switch.Thumb />
        </Switch.Root>
      )}
    </Flex>
  );
}
