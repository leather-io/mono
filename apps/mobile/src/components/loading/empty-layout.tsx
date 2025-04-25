import { Flag, ItemLayout, Text } from '@leather.io/ui/native';

interface EmptyLayoutProps {
  img?: React.ReactNode;
  title: string;
  subtitle: string;
}
export function EmptyLayout({ title, subtitle, img }: EmptyLayoutProps) {
  return (
    <Flag
      borderRadius="sm"
      borderColor="ink.border-default"
      borderWidth={1}
      borderStyle="dashed"
      width={350}
      img={img}
    >
      <ItemLayout
        titleLeft={
          <Text variant="label03" color="ink.text-primary">
            {title}
          </Text>
        }
        captionLeft={
          <Text variant="caption01" color="ink.text-subdued">
            {subtitle}
          </Text>
        }
      />
    </Flag>
  );
}
