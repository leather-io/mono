import { Badge, type BadgeProps, BasicTooltip } from '@leather.io/ui';

type TooltipSideType = 'bottom' | 'left' | 'right' | 'top';

interface BadgeWithTooltipProps extends BadgeProps {
  hoverLabel: string;
  side?: TooltipSideType;
}
export function BadgeWithTooltip({ hoverLabel, side = 'bottom', ...props }: BadgeWithTooltipProps) {
  return (
    <BasicTooltip label={hoverLabel} side={side}>
      <Badge {...props} />
    </BasicTooltip>
  );
}
