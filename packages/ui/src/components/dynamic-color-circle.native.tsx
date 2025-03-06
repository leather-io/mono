import { Image, View } from 'react-native';

interface DynamicColorCircleProps {
  value: string;
  children?: React.ReactNode;
}
export function DynamicColorCircle({ children, value }: DynamicColorCircleProps) {
  const sizeParam = '36';
  return (
    <View
      style={{
        position: 'relative',
        width: parseInt(sizeParam),
        height: parseInt(sizeParam),
        borderRadius: parseInt(sizeParam) / 2,
      }}
    >
      <Image
        alt="Dynamic avatar"
        source={{ uri: `https://avatar.vercel.sh/${value}?size=${sizeParam}` }}
        // style={{ borderRadius: parseInt(sizeParam) / 2 }}
      />
      {children}
    </View>
  );
}
