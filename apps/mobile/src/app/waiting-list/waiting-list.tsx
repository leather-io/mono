import { useEffect, useState } from 'react';
import { Image, Keyboard, KeyboardAvoidingView, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import CheckmarkCircle from '@/assets/checkmark-circle.svg';
import XLogo from '@/assets/logo-x.svg';
import { AnimatedButton, Button, ButtonState } from '@/components/button';
import { InputState, TextInput } from '@/components/text-input';
import { TransText } from '@/components/trans-text';
import { BROWSER_EXTENSION_LINK, TWITTER_LINK } from '@/constants';
import { useSubmitWaitingListEmailForm } from '@/queries/use-submit-waiting-list-form-email';
import { emailRegexp } from '@/utils/regexp';
import { Trans, t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Linking from 'expo-linking';
import LottieView from 'lottie-react-native';

import { Box, Text, Theme } from '@leather.io/ui/native';

import { WelcomeScreenTestIds } from '../../../test-ids';
import { Spinner } from '../../components/spinner';
import {
  BOTTOM_SHEET,
  BTC,
  CONTAINER,
  DIAMOND,
  SUBTITLE_1,
  TITLE_1,
  TITLE_2,
  animate,
  bottomSheetAnimationFn,
  iconIntroAnimationFn,
  keyboardAnimationFn,
  stringAnimationFn,
} from './animation-utils';

interface WelcomeScreenLayoutProps {
  onHiddenPressAction(): void;
}
export function WaitingList(props: WelcomeScreenLayoutProps) {
  const { onHiddenPressAction } = props;

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    mutate: submitForm,
    isPending,
    data: formData,
    reset: resetForm,
    isError: isSubmissionError,
  } = useSubmitWaitingListEmailForm();

  const isSubmitted = !!formData;

  const btc = {
    left: useSharedValue<number>(BTC.startPosition.left),
    top: useSharedValue<number>(BTC.startPosition.top),
    rotationDeg: useSharedValue<number>(BTC.startPosition.rotationDeg),
  };
  const diamond = {
    left: useSharedValue<number>(DIAMOND.startPosition.left),
    top: useSharedValue<number>(DIAMOND.startPosition.top),
    rotationDeg: useSharedValue<number>(DIAMOND.startPosition.rotationDeg),
  };

  const root = {
    top: useSharedValue<number>(CONTAINER.mainPosition.top),
  };

  const title1 = {
    opacity: useSharedValue<number>(TITLE_1.startPosition.opacity),
    left: useSharedValue<number>(TITLE_1.startPosition.left),
  };
  const title2 = {
    opacity: useSharedValue<number>(TITLE_2.startPosition.opacity),
    left: useSharedValue<number>(TITLE_2.startPosition.left),
  };
  const subtitle = {
    opacity: useSharedValue<number>(SUBTITLE_1.startPosition.opacity),
    left: useSharedValue<number>(SUBTITLE_1.startPosition.left),
  };

  const bottomSheet = {
    bottom: useSharedValue<number>(BOTTOM_SHEET.startPosition.bottom),
  };

  const btcStyle = useAnimatedStyle(() => {
    return {
      left: btc.left.value,
      top: btc.top.value,
      transform: [{ rotateZ: `${btc.rotationDeg.value}deg` }],
    };
  });

  const diamondStyle = useAnimatedStyle(() => {
    return {
      left: diamond.left.value,
      top: diamond.top.value,
      transform: [{ rotateZ: `${diamond.rotationDeg.value}deg` }],
    };
  });

  const rootStyle = useAnimatedStyle(() => {
    return {
      top: root.top.value,
    };
  });

  const title1Style = useAnimatedStyle(() => {
    return {
      opacity: title1.opacity.value,
      left: title1.left.value,
    };
  });
  const title2Style = useAnimatedStyle(() => {
    return {
      opacity: title2.opacity.value,
      left: title2.left.value,
    };
  });
  const subtitleStyle = useAnimatedStyle(() => {
    return {
      opacity: subtitle.opacity.value,
      left: subtitle.left.value,
    };
  });

  const bottomSheetStyle = useAnimatedStyle(() => ({
    bottom: bottomSheet.bottom.value,
  }));

  useEffect(() => {
    animate(title1, stringAnimationFn, TITLE_1.mainPosition);
    animate(title2, stringAnimationFn, TITLE_2.mainPosition);
    animate(subtitle, stringAnimationFn, SUBTITLE_1.mainPosition);
    animate(btc, iconIntroAnimationFn, BTC.mainPosition);
    animate(diamond, iconIntroAnimationFn, DIAMOND.mainPosition);
    animate(bottomSheet, bottomSheetAnimationFn, BOTTOM_SHEET.mainPosition);
  }, []);

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', () => {
      animate(root, keyboardAnimationFn, CONTAINER.keyboardPosition);
      animate(btc, keyboardAnimationFn, BTC.keyboardPosition);
      animate(diamond, keyboardAnimationFn, DIAMOND.keyboardPosition);
    });
    Keyboard.addListener('keyboardWillHide', () => {
      animate(root, keyboardAnimationFn, CONTAINER.mainPosition);
      animate(btc, keyboardAnimationFn, BTC.mainPosition);
      animate(diamond, keyboardAnimationFn, DIAMOND.mainPosition);
    });
    return () => {
      Keyboard.removeAllListeners('keyboardWillShow');
      Keyboard.removeAllListeners('keyboardWillHide');
    };
  }, []);

  // Show checkmark for 800ms before changing to the next screen state.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isSubmitted) {
      setShowSuccess(true);
      timeout = setTimeout(() => setShowSuccess(false), 800);
    }
    return () => clearTimeout(timeout);
  }, [isSubmitted]);

  const doesEmailPass = emailRegexp.test(email);
  const isButtonDisabled = !doesEmailPass || isPending;

  function getButtonState(): ButtonState {
    if (isPending) {
      return 'default';
    }
    if (isButtonDisabled) {
      return 'disabled';
    }
    if (isSubmitted) {
      return 'success';
    }
    return 'default';
  }

  function getInputState(): InputState {
    // TODO: some error here
    // eslint-disable-next-line no-constant-condition
    if (isSubmissionError) {
      return 'error';
    }
    if (isInputFocused) {
      return 'focused';
    }
    return 'default';
  }

  const theme = useTheme<Theme>();
  const buttonBackgroundColor = useSharedValue<undefined | string>(undefined);

  const sendButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: buttonBackgroundColor.value,
  }));
  useEffect(() => {
    // a manual way to set the background color of the animated button,
    // so that we can change to a success state with animation
    switch (getButtonState()) {
      case 'default': {
        buttonBackgroundColor.value = theme.colors['ink.text-primary'];
        break;
      }
      case 'disabled': {
        buttonBackgroundColor.value = theme.colors['ink.background-secondary'];
        break;
      }
      case 'success': {
        buttonBackgroundColor.value = withTiming(theme.colors['green.background-primary']);
        break;
      }
      case 'outline': {
        buttonBackgroundColor.value = theme.colors['ink.background-primary'];
        break;
      }
    }
  }, [getButtonState]);

  const submittedComponent = (
    <Box backgroundColor="ink.background-primary" padding="6">
      <TransText variant="body01" color="ink.text-subdued" paddingBottom="5">
        Thanks for subscribing! We'll notify you when Leather's mobile app launches. In the
        meantime, please{' '}
        <Text
          onPress={() => Linking.openURL(BROWSER_EXTENSION_LINK)}
          textDecorationLine="underline"
        >
          check out our browser extension.
        </Text>
      </TransText>
      <Button
        testID={WelcomeScreenTestIds.OpenXButton}
        onPress={() => Linking.openURL(TWITTER_LINK)}
        title={t`Follow us`}
        buttonState="outline"
        Icon={XLogo}
        mb="3"
      />
      <Button
        testID={WelcomeScreenTestIds.DoneButton}
        onPress={() => {
          resetForm();
          setEmail('');
        }}
        mb="7"
        title={t`Done`}
        buttonState="default"
      />
    </Box>
  );

  const submissionComponent = (
    <Box backgroundColor="ink.background-primary" padding="6">
      <TransText variant="body01" color="ink.text-subdued" paddingBottom="5">
        Stay in the loop and be the first one to hear about new developments
      </TransText>

      <TextInput
        value={email}
        onChangeText={val => {
          setEmail(val);
          resetForm();
        }}
        onFocus={() => {
          setIsInputFocused(true);
        }}
        onBlur={() => {
          setIsInputFocused(false);
        }}
        inputState={getInputState()}
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        inputMode="email"
        returnKeyType="done"
        autoCorrect={false}
        spellCheck={false}
        mb="6"
        testID={WelcomeScreenTestIds.EmailInput}
        placeholder={t`Email address`}
        // This input is currently flickering and that is a bug introduced in ios 17.
        // Refer to this issue in RN: https://github.com/facebook/react-native/issues/39411
      />
      <AnimatedButton
        style={sendButtonStyle}
        onPress={() => {
          submitForm(email);
        }}
        mb="7"
        title={isPending || showSuccess ? undefined : t`Submit`}
        buttonState={getButtonState()}
        disabled={isButtonDisabled}
        testID={WelcomeScreenTestIds.SubmitEmailButton}
        Icon={isPending ? Spinner : showSuccess ? CheckmarkCircle : undefined}
      />
    </Box>
  );

  return (
    <Box flex={1} backgroundColor="ink.background-secondary">
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, rootStyle]}>
          <Box paddingHorizontal="5" paddingTop="5">
            <Box mb="7">
              <LottieView
                resizeMode="cover"
                style={{ width: 149, height: 32 }}
                speed={1}
                source={require('@/assets/logoReveal.json')}
                renderMode="SOFTWARE"
                autoPlay
                loop={false}
              />
            </Box>
            <Trans>
              <Animated.View style={title1Style}>
                <TransText variant="heading02" color="ink.text-primary">
                  Bitcoin for
                </TransText>
              </Animated.View>
              <Animated.View style={title2Style}>
                <TransText variant="heading02" color="ink.text-primary">
                  the rest of us
                </TransText>
              </Animated.View>
            </Trans>
            <Animated.View style={subtitleStyle}>
              <TransText variant="heading05" color="ink.text-primary" paddingTop="5">
                Leather is the only wallet you need to tap into the multilayered Bitcoin economy
              </TransText>
            </Animated.View>
            <Animated.View
              style={[{ position: 'absolute', transform: [{ rotateZ: '100deg' }] }, btcStyle]}
            >
              <Pressable onLongPress={() => onHiddenPressAction()}>
                <Image
                  style={{ width: 73, height: 73 }}
                  source={require('@/assets/Pixel BTC.png')}
                />
              </Pressable>
            </Animated.View>
            <Animated.View style={[{ position: 'absolute' }, diamondStyle]}>
              <Image style={{ width: 69, height: 88.5 }} source={require('@/assets/crystal.png')} />
            </Animated.View>
          </Box>
        </Animated.View>
      </SafeAreaView>
      <KeyboardAvoidingView behavior="position">
        <Animated.View style={bottomSheetStyle}>
          {isSubmitted && !showSuccess ? submittedComponent : submissionComponent}
        </Animated.View>
      </KeyboardAvoidingView>
    </Box>
  );
}
