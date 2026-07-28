import { styled } from 'leather-styles/jsx';

interface ActivityGroupHeaderProps {
  label: string;
}

export function ActivityGroupHeader({ label }: ActivityGroupHeaderProps) {
  return (
    <styled.div bg="ink.background-primary" px="space.04" pt="space.04" pb="space.02">
      <styled.span textStyle="body.02" color="ink.text-subdued">
        {label}
      </styled.span>
    </styled.div>
  );
}
