import { type ReactNode } from 'react';

import { css } from 'leather-styles/css';

import { ExternalLinkIcon, ItemLayout, ItemLayoutWithButtons, Switch } from '@leather.io/ui';

import { NewIconWrapper } from '@app/components/icon-wrapper';

import { TitleWithTooltip } from './title-with-tooltip';

interface GeneralSettingsButtonProps {
  icon: ReactNode;
  title: string;
  onClick(): void;
  tooltipText?: string;
}

interface SimpleSettingsButtonProps extends GeneralSettingsButtonProps {
  variant: 'chevron' | 'external';
}
interface SwitchSettingsButtonProps extends GeneralSettingsButtonProps {
  variant: 'switch';
  isEnabled: boolean;
}

export function SettingsButton({
  icon,
  title,
  onClick,
  tooltipText,
  ...props
}: SimpleSettingsButtonProps | SwitchSettingsButtonProps) {
  return (
    <button
      className={css({
        _hover: {
          backgroundColor: 'ink.component-background-hover',
        },
        mx: '-space.05',
        px: 'space.05',
        py: 'space.03',
        borderRadius: 'xs',
      })}
      onClick={onClick}
    >
      {props.variant === 'switch' && (
        <ItemLayoutWithButtons
          img={<NewIconWrapper>{icon}</NewIconWrapper>}
          title={
            !tooltipText ? title : <TitleWithTooltip title={title} tooltipText={tooltipText} />
          }
          buttons={
            <Switch.Root checked={props.isEnabled}>
              <Switch.Thumb></Switch.Thumb>
            </Switch.Root>
          }
        />
      )}
      {props.variant === 'chevron' && (
        <ItemLayout
          showChevron
          titleRight={null}
          img={<NewIconWrapper>{icon}</NewIconWrapper>}
          titleLeft={
            !tooltipText ? title : <TitleWithTooltip title={title} tooltipText={tooltipText} />
          }
          captionLeft={null}
        />
      )}
      {props.variant === 'external' && (
        <ItemLayoutWithButtons
          img={<NewIconWrapper>{icon}</NewIconWrapper>}
          title={
            !tooltipText ? title : <TitleWithTooltip title={title} tooltipText={tooltipText} />
          }
          buttons={<ExternalLinkIcon variant="small" />}
        />
      )}
    </button>
  );
}
