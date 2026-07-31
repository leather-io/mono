import { styled } from 'leather-styles/jsx';

interface ActivityGroupHeaderProps {
  label: string;
  isFirstGroup: boolean;
}

export function ActivityGroupHeader({ label, isFirstGroup }: ActivityGroupHeaderProps) {
  return (
    <styled.div
      bg="ink.background-primary"
      px="space.04"
      pt={isFirstGroup ? 'space.00' : 'space.04'}
      pb="space.02"
    >
      <styled.span textStyle="body.02" color="ink.text-subdued">
        {label}
      </styled.span>
    </styled.div>
  );
}
