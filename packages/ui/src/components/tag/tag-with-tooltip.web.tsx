import { BasicTooltip } from '../tooltip/basic-tooltip.web';
import { Tag, type TagProps, type TagVariants } from './tag.web';

type TooltipSideType = 'bottom' | 'left' | 'right' | 'top';

interface TagWithTooltipProps extends TagProps {
  hoverLabel: string;
  side?: TooltipSideType;
}
export function TagWithTooltip({
  hoverLabel,
  side = 'bottom',
  ...props
}: TagWithTooltipProps & TagVariants) {
  return (
    <BasicTooltip label={hoverLabel} side={side}>
      <Tag {...props} />
    </BasicTooltip>
  );
}
