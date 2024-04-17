import { useEffect, useState } from 'react';
import { Image, Keyboard, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import CheckmarkCircle from '@/assets/checkmark-circle.svg';
import XLogo from '@/assets/logo-x.svg';
import { Button, ButtonState } from '@/components/Button';
import { InputState, TextInput } from '@/components/TextInput';
import { BROWSER_EXTENSION_LINK, TWITTER_LINK } from '@/constants';
import { useFormSubmission } from '@/queries/use-form-submissions';
import { emailRegexp } from '@/utils/regexp';
import { Box, Text } from '@leather-wallet/ui/native';
import * as Linking from 'expo-linking';
import LottieView from 'lottie-react-native';

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
import { Spinner } from './spinner';

export function WelcomeScreen() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [email, setEmail] = useState('');

  const {
    mutate: submitForm,
    isLoading,
    data: formData,
    reset: resetForm,
    isError: isSubmissionError,
  } = useFormSubmission();

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

  const doesEmailPass = emailRegexp.test(email);
  const isButtonDisabled = !doesEmailPass || isLoading;

  function getButtonState(): ButtonState {
    if (isLoading) {
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

  const submittedComponent = (
    <Box backgroundColor="base.ink.background-primary" padding="6">
      <Text variant="body01" color="base.ink.text-subdued" paddingBottom="5">
        Thanks for subscribing! We'll notify you when Leather's mobile app launches. In the
        meantime, please{' '}
        <Text
          onPress={() => Linking.openURL(BROWSER_EXTENSION_LINK)}
          textDecorationLine="underline"
        >
          check out our browser extension.
        </Text>
      </Text>
      <Button
        onPress={() => Linking.openURL(TWITTER_LINK)}
        title="Follow us"
        buttonState="outline"
        Icon={<XLogo width={20} height={20} />}
        mb="3"
      />
      <Button
        onPress={() => {
          resetForm();
          setEmail('');
        }}
        mb="7"
        title="Done"
        buttonState="default"
      />
    </Box>
  );

  const submissionComponent = (
    <Box backgroundColor="base.ink.background-primary" padding="6">
      <Text variant="body01" color="base.ink.text-subdued" paddingBottom="5">
        Stay in the loop and be the first one to hear about new developments
      </Text>

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
        mb="6"
        placeholder="Email address"
      />
      <Button
        onPress={() => {
          submitForm(email);
        }}
        mb="7"
        title={isLoading || isSubmitted ? undefined : 'Submit'}
        buttonState={getButtonState()}
        disabled={isButtonDisabled}
        Icon={
          isLoading ? (
            <Spinner />
          ) : isSubmitted ? (
            <CheckmarkCircle width={20} height={20} />
          ) : undefined
        }
      />
    </Box>
  );

  return (
    <Box flex={1} backgroundColor="dark.ink.background-secondary">
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
            <Animated.View style={title1Style}>
              <Text variant="heading02" color="dark.ink.text-primary">
                Bitcoin for
              </Text>
            </Animated.View>
            <Animated.View style={title2Style}>
              <Text variant="heading02" color="dark.ink.text-primary">
                the rest of us
              </Text>
            </Animated.View>
            <Animated.View style={subtitleStyle}>
              <Text variant="heading05" color="dark.ink.text-primary" paddingTop="5">
                Leather is the only wallet you need to tap into the multilayered Bitcoin economy
              </Text>
            </Animated.View>
            <Animated.View
              style={[{ position: 'absolute', transform: [{ rotateZ: '100deg' }] }, btcStyle]}
            >
              <Image style={{ width: 73, height: 73 }} source={require('@/assets/Pixel BTC.png')} />
            </Animated.View>
            <Animated.View style={[{ position: 'absolute' }, diamondStyle]}>
              <Image style={{ width: 69, height: 88.5 }} source={require('@/assets/crystal.png')} />
            </Animated.View>
          </Box>
        </Animated.View>
      </SafeAreaView>
      <KeyboardAvoidingView behavior="position">
        <Animated.View style={bottomSheetStyle}>
          {isSubmitted ? submittedComponent : submissionComponent}
        </Animated.View>
      </KeyboardAvoidingView>
    </Box>
  );
}
