import React, { cloneElement, isValidElement } from 'react';

import {
  Box,
  BoxProps,
  Flex,
  FlexProps,
  HTMLStyledProps,
  Stack,
  StackProps,
  styled,
} from 'leather-styles/jsx';

import { Hr } from '@leather.io/ui';

interface InfoCardProps extends FlexProps {
  title?: string;
}
export function InfoCard({ title, children, ...props }: InfoCardProps) {
  return (
    <Flex
      flexDirection="column"
      border="default"
      minHeight="84px"
      padding="space.05"
      borderRadius="sm"
      {...props}
    >
      {title && (
        <styled.h3 textStyle="label.01" mb="space.05">
          {title}
        </styled.h3>
      )}
      {children}
    </Flex>
  );
}

type ChildProps = BoxProps;

type TChild = string | React.ReactElement<ChildProps>;

interface Props extends BoxProps {
  children: TChild | TChild[];
}
function InfoCardGroup({ children, ...props }: Props) {
  const parsedChildren = Array.isArray(children) ? children : [children];
  const infoGroup = parsedChildren.flatMap((child, index) => {
    if (!isValidElement(child)) return null;
    return [
      cloneElement(child, {
        key: index,
        mb: index === parsedChildren.length ? '280px' : undefined,
      }),
      index !== parsedChildren.length - 1 && <Hr my="space.06" key={index.toString() + '-hr'} />,
    ];
  });
  return <Box {...props}>{infoGroup}</Box>;
}

function InfoCardSection({ children, ...props }: StackProps) {
  return <Stack {...props}>{children}</Stack>;
}

function InfoCardRow(props: FlexProps) {
  return <Flex justifyContent="space-between" {...props} />;
}

interface InfoCardLabelProps extends FlexProps {
  explainer?: string;
}
function InfoCardLabel({ children, ...props }: InfoCardLabelProps) {
  return (
    <Flex textStyle="label.03" color="ink.text-subdued" alignItems="center" {...props}>
      <Box mr={props.explainer ? 'space.01' : undefined}>{children}</Box>
    </Flex>
  );
}

function InfoCardValue(props: HTMLStyledProps<'p'>) {
  return <styled.p textStyle="label.03" textAlign="right" color="ink.text-primary" {...props} />;
}

InfoCard.Section = InfoCardSection;
InfoCard.Group = InfoCardGroup;
InfoCard.Row = InfoCardRow;
InfoCard.Label = InfoCardLabel;
InfoCard.Value = InfoCardValue;
