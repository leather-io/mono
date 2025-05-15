import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useCameraPermission } from '@/features/qr-scanner/use-camera-permission';
import {
  BarcodePoint,
  type BarcodeScanningResult,
  CameraView,
  type CameraViewProps,
} from 'expo-camera';

interface QrScannerCameraProps extends CameraViewProps {
  onBarcodeScanned: (result: BarcodeScanningResult) => void;
}

export function QrScannerCamera({ onBarcodeScanned }: QrScannerCameraProps) {
  const { width, height } = useWindowDimensions();
  const permissionGranted = useCameraPermission();
  const { animatedStyle, startAnimating } = useCameraFadeInAnimation();

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    // Fullscreen camera views are often cropped, so some content detected by the camera may be offscreen.
    // Process QRs only if they're visible to the user.
    if (!isQrInViewport(width, height, result.cornerPoints)) {
      return;
    }

    onBarcodeScanned(result);
  }

  return (
    <Animated.View style={animatedStyle}>
      {permissionGranted && (
        <CameraView
          style={{ width, height }}
          mode="picture"
          mute
          onCameraReady={startAnimating}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}
    </Animated.View>
  );
}

function useCameraFadeInAnimation() {
  const opacity = useSharedValue(0);

  function startAnimating() {
    opacity.value = withTiming(1, {
      duration: 280,
      easing: Easing.quad,
    });
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return { startAnimating, animatedStyle };
}

function isQrInViewport(screenWidth: number, screenHeight: number, qrCornerPoints: BarcodePoint[]) {
  if (!qrCornerPoints || qrCornerPoints.length !== 4) {
    return true;
  }

  return qrCornerPoints.every(
    point => point.x >= 0 && point.x <= screenWidth && point.y >= 0 && point.y <= screenHeight
  );
}
