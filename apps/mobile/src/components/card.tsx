import { Pressable, PressableProps } from '@leather.io/ui/native';

interface CardProps extends PressableProps {
  onPress?(): void;
  height?: number;
}
export function Card({ children, onPress, height = 180, ...props }: CardProps) {
  return (
    <Pressable
      height={height}
      p="4"
      justifyContent="space-between"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-transparent"
      borderRadius="md"
      onPress={onPress}
      pressEffect={{
        opacity: { from: 1, to: 0.95 },
        transform: { from: [{ scale: 1 }], to: [{ scale: 0.95 }] },
      }}
      {...props}
    >
      {children}
    </Pressable>
  );
}
