import Animated, { withDelay, withTiming } from 'react-native-reanimated';

import { AccountAvatar } from '@/features/account/components/account-avatar';
import { t } from '@lingui/macro';

import {
  AddressDisplayer,
  Box,
  Flag,
  IconButton,
  PersonIcon,
  Pressable,
  QrCodeIcon,
  Text,
} from '@leather.io/ui/native';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface RecipientToggleProps {
  onPress(): void;
  value: string;
  onQrButtonPress(): void;
}

export function RecipientToggle({ onPress, onQrButtonPress, value }: RecipientToggleProps) {
  return (
    <Pressable
      onPress={onPress}
      pressEffects={{
        backgroundColor: {
          from: 'ink.background-primary',
          to: 'ink.background-secondary',
        },
      }}
    >
      <Box
        borderColor="ink.border-default"
        borderRadius="sm"
        borderWidth={1}
        overflow="hidden"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        py="3"
        pl="4"
        pr="2"
      >
        {value ? (
          <AnimatedBox flexDirection="row" entering={enteringAnimation}>
            <Flag img={<AccountAvatar icon={PersonIcon} />}>
              <AddressDisplayer address={value} />
            </Flag>
          </AnimatedBox>
        ) : (
          <>
            <Text variant="label02" color="ink.text-subdued">
              {t({
                id: 'send_form.recipient.toggle.label',
                message: 'Enter recipient',
              })}
            </Text>
            <IconButton
              hitSlop={8}
              label={t({
                id: 'send-form.recipient.qr_button',
                message: 'Scan a QR code',
              })}
              icon={<QrCodeIcon />}
              onPress={onQrButtonPress}
            />
          </>
        )}
      </Box>
    </Pressable>
  );
}

function enteringAnimation() {
  'worklet';
  return {
    initialValues: {
      opacity: 0,
      //transform: [{ translateY: -3 }],
    },
    animations: {
      opacity: withDelay(80, withTiming(1, { duration: 240 })),
      //transform: [{ translateY: withTiming(0, { duration: 240 }) }],
    },
  };
}
