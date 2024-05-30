import { useRef, useState } from 'react';

import { spamFilter } from '@leather-wallet/utils';

import { BasicTooltip, Title } from '../../web';
import { useOnResizeListener } from '../hooks/use-on-resize-listener';

interface TransactionTitleProps {
  title: string;
}
export function TransactionTitle(props: TransactionTitleProps) {
  const { title } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const element = ref.current!;
  const [isEllipsisActive, setIsEllipsisActive] = useState(
    element?.scrollWidth > element?.clientWidth
  );
  const onResize = () => setIsEllipsisActive(element?.scrollWidth > element?.clientWidth);

  useOnResizeListener(onResize);

  return (
    <BasicTooltip disabled={!isEllipsisActive} label={title} side="top">
      <Title
        overflow="hidden"
        ref={ref}
        textOverflow="ellipsis"
        textStyle="label.02"
        whiteSpace="nowrap"
      >
        {spamFilter(title)}
      </Title>
    </BasicTooltip>
  );
}
