import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@leather.io/ui/native';

export function GradientBorder() {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[
        colors['ink.background-primary'],
        colors['ink.border-default'],
        colors['ink.border-default'],
        colors['ink.background-primary'],
      ]}
      locations={[0, 0.4, 0.6, 1]}
      style={{ width: '100%', height: 1 }}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
    />
  );
}
