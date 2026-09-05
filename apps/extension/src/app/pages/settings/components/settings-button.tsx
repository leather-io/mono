import type { ComponentProps } from 'react';

import { css } from 'leather-styles/css';

import {
  Avatar,
  ExternalLinkIcon,
  ItemLayout,
  ItemLayoutWithButtons,
  Switch,
} from '@leather.io/ui';

import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { TitleWithTooltip } from './title-with-tooltip';

interface GeneralSettingsButtonProps {
  icon: ComponentProps<typeof Avatar>['icon'] | null;
  title: string;
  onClick(): void;
  tooltipText?: string;
  disabledTooltipText?: string;
  isDisabled?: boolean;
  status?: string;
  ['data-testid']?: string;
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
  disabledTooltipText,
  isDisabled = false,
  status,

  ...props
}: SimpleSettingsButtonProps | SwitchSettingsButtonProps) {
  const avatarIcon = icon ?? undefined;
  const button = (
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
      aria-disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) onClick();
      }}
      data-testid={props['data-testid']}
    >
      {props.variant === 'switch' && (
        <ItemLayoutWithButtons
          img={
            <Avatar
              size="lg"
              bg="ink.component-background-hover"
              outlineColor="ink.component-background-hover"
              icon={avatarIcon}
            />
          }
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
          showChevron={!isDisabled}
          titleRight={status ?? null}
          img={
            <Avatar
              size="lg"
              bg="ink.component-background-hover"
              outlineColor="ink.component-background-hover"
              icon={avatarIcon}
            />
          }
          titleLeft={
            !tooltipText ? title : <TitleWithTooltip title={title} tooltipText={tooltipText} />
          }
          captionLeft={null}
        />
      )}
      {props.variant === 'external' && (
        <ItemLayoutWithButtons
          img={
            <Avatar
              size="lg"
              bg="ink.component-background-hover"
              outlineColor="ink.component-background-hover"
              icon={avatarIcon}
            />
          }
          title={
            !tooltipText ? title : <TitleWithTooltip title={title} tooltipText={tooltipText} />
          }
          buttons={<ExternalLinkIcon variant="small" />}
        />
      )}
    </button>
  );
  if (!isDisabled) return button;
  return (
    <BasicTooltip asChild label={disabledTooltipText} side="top">
      {button}
    </BasicTooltip>
  );
}
