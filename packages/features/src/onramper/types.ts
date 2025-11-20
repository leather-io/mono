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
