import { type ReactNode, useId, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Switch } from '@leather.io/ui';

import { type DirectionSwitchRowProps, useApprovalDirection } from './approval-direction';
import { approvalInteractiveRow } from './approval-surface';

function BaselineSwitchRow({
  switchId,
  title,
  caption,
  icon,
  isChecked,
  onCheckedChange,
}: DirectionSwitchRowProps) {
  return (
    <Flex
      alignItems="center"
      gap={icon ? 'space.03' : 'space.04'}
      py="space.02"
      className={approvalInteractiveRow}
    >
      {icon && (
        <Box flexShrink={0} lineHeight={0}>
          {icon}
        </Box>
      )}
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.label
          htmlFor={switchId}
          display="flex"
          minWidth={0}
          textStyle="label.02"
          cursor="pointer"
        >
          {title}
        </styled.label>
        {caption && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {caption}
          </styled.span>
        )}
      </Stack>
      <Box flexShrink={0} lineHeight={0}>
        <Switch.Root id={switchId} checked={isChecked} onCheckedChange={onCheckedChange}>
          <Switch.Thumb />
        </Switch.Root>
      </Box>
    </Flex>
  );
}

interface ApprovalSwitchRowProps {
  title: ReactNode;
  caption?: ReactNode;
  icon?: ReactNode;
  isDefaultOn?: boolean;
}

export function ApprovalSwitchRow({
  title,
  caption,
  icon,
  isDefaultOn = false,
}: ApprovalSwitchRowProps) {
  const [isChecked, setIsChecked] = useState(isDefaultOn);
  const switchId = useId();
  const Row = useApprovalDirection()?.SwitchRow ?? BaselineSwitchRow;
  return (
    <Row
      switchId={switchId}
      title={title}
      caption={caption}
      icon={icon}
      isChecked={isChecked}
      onCheckedChange={setIsChecked}
    />
  );
}
