import type { ReactNode } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { isFunction, isString } from '@leather.io/utils';

import { Favicon } from '../../../components/favicon/favicon.web';
import { Flag } from '../../../components/flag/flag.web';
import { HasChildren } from '../../../utils/has-children.shared';
import { ApproverHeaderAnimation } from '../animations/approver-animation.web';
import { useApproverContext, useRegisterApproverChild } from '../approver-context.shared';

interface ApproverHeaderProps extends HasChildren {
  title: ReactNode;
  info?: ReactNode;
  onPressRequestedByLink?(e: React.MouseEvent<HTMLAnchorElement>): void;
}
export function ApproverHeader({ title, info, onPressRequestedByLink }: ApproverHeaderProps) {
  const { requester, hostname } = useApproverContext();
  useRegisterApproverChild('header');
  return (
    <styled.header
      px="space.05"
      pt="space.04"
      pb="space.04"
      className="skip-animation"
      pos="relative"
    >
      <ApproverHeaderAnimation>
        <styled.h1 textStyle="heading.03" mr={info ? 'space.06' : undefined}>
          {title}
        </styled.h1>
      </ApproverHeaderAnimation>
      <ApproverHeaderAnimation delay={0.04}>
        <Flag
          spacing="space.01"
          mt="space.02"
          textStyle="label.03"
          align="middle"
          img={isString(requester) ? <Favicon origin={requester} /> : requester}
        >
          Requested by{' '}
          <styled.a
            href={requester}
            onClick={isFunction(onPressRequestedByLink) ? onPressRequestedByLink : undefined}
            target="_blank"
            pos="relative"
            _before={{
              pos: 'absolute',
              content: '""',
              width: '100%',
              height: '1px',
              bg: 'ink.text-non-interactive',
              bottom: 0,
            }}
          >
            {hostname}
          </styled.a>
        </Flag>
      </ApproverHeaderAnimation>
      {info && (
        <Box pos="absolute" top="space.03" right="space.05" mt="space.02">
          {info}
        </Box>
      )}
    </styled.header>
  );
}
