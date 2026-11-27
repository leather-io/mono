import { type ReactElement, cloneElement, useRef } from 'react';
import { View, type ViewInstance } from 'react-native';

interface AssetPickerItemProps {
  onPress(top: number | null): void;
  children: ReactElement<Partial<{ onPress(): void }>> | null;
  canAnimate?: boolean;
  testID?: string;
}

export function AssetPickerItem({ onPress, children, canAnimate, testID }: AssetPickerItemProps) {
  const ref = useRef<ViewInstance>(null);

  function handlePress() {
    if (canAnimate) {
      ref.current?.measureInWindow((...measurements) => {
        onPress(Math.min(measurements[1], 200));
      });
    } else {
      onPress(null);
    }
  }

  return (
    <View ref={ref} testID={testID}>
      {children &&
        cloneElement(children, {
          onPress: handlePress,
        })}
    </View>
  );
}
