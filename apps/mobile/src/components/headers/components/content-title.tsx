import { Text, TextProps } from '@leather.io/ui/native';

interface ContentTitleProps extends TextProps {
  title: string | React.ReactNode;
}
export function ContentTitle({ title, ...props }: ContentTitleProps) {
  return typeof title === 'string' ? (
    <Text variant="heading03" {...props}>
      {title}
    </Text>
  ) : (
    title
  );
}
