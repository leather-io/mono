import { ReactNode } from 'react';

import { type RecipeVariantProps, cva } from 'leather-styles/css';
import { Box, type BoxProps, Flex, Stack, styled } from 'leather-styles/jsx';
import { SystemProperties } from 'leather-styles/types';

import { CheckmarkCircleIcon } from '../../icons/checkmark-circle-icon.web';
import { ErrorTriangleIcon } from '../../icons/error-triangle-icon.web';
import { InfoCircleIcon } from '../../icons/info-circle-icon.web';
import { renderIntoPortal } from '../../utils/render-into-portal.web';

const defaultPortalElementId = 'callout-portal';

const calloutRecipe = cva({
  variants: {
    variant: {
      default: {
        bg: 'ink.text-non-interactive',
      },
      error: {
        bg: 'red.background-secondary',
      },
      info: {
        bg: 'blue.background-secondary',
      },
      success: {
        bg: 'green.background-secondary',
      },
      warning: {
        bg: 'yellow.background-secondary',
      },
    },
  },
});

const icons = {
  info: <InfoCircleIcon />,
  success: <CheckmarkCircleIcon />,
  warning: <ErrorTriangleIcon />,
  error: <ErrorTriangleIcon />,
  default: null,
};

interface CalloutOwnProps {
  /** Title of the callout.  */
  title?: string;
  /** Contents of the callout */
  children?: ReactNode;
  /** Specify a custom icon to override the default for the variant. */
  icon?: ReactNode;
  /** Limit the content width to the specified value. Suitable for full-width callouts displayed at the top of the page. */
  maxContentWidth?: SystemProperties['maxWidth'];
  /** Render the callout in a portal. */
  portal?: boolean;
  /** Specify a custom element ID for portalled rendering.
   * @default 'callout-portal' */
  portalElementId?: string;
}

type CalloutVariants = RecipeVariantProps<typeof calloutRecipe>;

export type CalloutProps = CalloutOwnProps & CalloutVariants & BoxProps;

export function Callout({
  children,
  icon,
  title,
  variant = 'default',
  maxContentWidth,
  portal,
  portalElementId = defaultPortalElementId,
  ...rest
}: CalloutProps) {
  const content = (
    <Box className={calloutRecipe({ variant })} role="status" {...rest}>
      <Flex
        justifyContent="space-between"
        maxWidth={maxContentWidth}
        mx="auto"
        py="space.04"
        px="space.05"
        gap="space.03"
        color="ink.text-primary"
        width="100%"
      >
        <Stack gap="space.01" justifyContent="center">
          {title && <styled.span textStyle="label.02">{title}</styled.span>}
          {children && <styled.span textStyle="caption.01">{children}</styled.span>}
        </Stack>
        <styled.span aria-hidden="true" flexShrink={0}>
          {icon ?? icons[variant]}
        </styled.span>
      </Flex>
    </Box>
  );

  if (portal) {
    return renderIntoPortal(content, portalElementId);
  }

  return content;
}
