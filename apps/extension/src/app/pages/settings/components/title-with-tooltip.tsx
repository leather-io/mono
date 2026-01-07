import { Flex } from 'leather-styles/jsx';

import { BasicTooltip, QuestionCircleIcon } from '@leather.io/ui';

interface TitleWithTooltipProps {
  title: string;
  tooltipText: string;
}

export function TitleWithTooltip({ title, tooltipText }: TitleWithTooltipProps) {
  return (
    <Flex gap="space.01">
      {title}
      <BasicTooltip side="top" label={tooltipText}>
        <QuestionCircleIcon variant="small" />
      </BasicTooltip>
    </Flex>
  );
}
