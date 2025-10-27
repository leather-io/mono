import { ComponentProps } from 'react';
import type WebView from 'react-native-webview';

export type OnramperMode = 'buy' | 'sell' | 'swap';

export interface BaseOnramperProps {
  widgetHost: string;
  theme: 'light' | 'dark';
  btcAddress: string | undefined;
  stxAddress: string | undefined;
  apiKey: string;
  signingSecret: string;
  mode: OnramperMode;
  successRedirectUrl: string | undefined;
  failureRedirectUrl: string | undefined;
}

export type WebOnramperProps = BaseOnramperProps &
  React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
export type MobileOnramperProps = BaseOnramperProps & ComponentProps<typeof WebView>;
