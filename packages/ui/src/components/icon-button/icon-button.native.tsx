import { TouchableOpacity } from 'react-native';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress(): void;
}
export function IconButton({ icon, onPress }: IconButtonProps) {
  return <TouchableOpacity onPress={onPress}>{icon}</TouchableOpacity>;
}
