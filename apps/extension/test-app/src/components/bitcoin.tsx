import React from 'react';

import { styled } from 'leather-styles/jsx';

import { LeatherProvider } from '@leather.io/rpc';

declare global {
  interface Window {
    btc?: LeatherProvider;
  }
}

const TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS = 'tb1qr8me8t9gu9g6fu926ry5v44yp0wyljrespjtnz';

export function Bitcoin() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <styled.h2>Bitcoin Testnet</styled.h2>
      <styled.span>Try testing Bitcoin transfers.</styled.span>

      <div
        style={{
          padding: '24px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
        }}
      >
        <styled.button
          mt={3}
          onClick={() => {
            window.btc
              ?.request('sendTransfer', {
                address: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
                amount: '10000',
                network: 'testnet4',
              })
              .then(() => {
                // Transfer successful
              })
              .catch(() => {
                // Transfer failed
              });
          }}
        >
          Send transfer
        </styled.button>
        <styled.button
          mt={3}
          onClick={() => {
            (window as any).LeatherProvider?.request('sendTransfer', {
              recipients: [
                {
                  address: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
                  amount: '800',
                },
                {
                  address: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
                  amount: '900',
                },
              ],
              network: 'testnet4',
            })
              .then(() => {
                // Transfer successful
              })
              .catch(() => {
                // Transfer failed
              });
          }}
        >
          Send transfer to multiple addresses
        </styled.button>
        <styled.button
          mt={3}
          onClick={() => {
            (window as any).LeatherProvider?.request('sendTransfer', {
              recipients: [
                {
                  address: 'bc1qps90ws94pvk548y9jg03gn5lwjqnyud4lg6y56',
                  amount: '800',
                },
                {
                  address: 'bc1qyrtw5v0rkmytg0gu34f06fxpyfk24x7jevtvx3',
                  amount: '10000',
                },
              ],
              network: 'mainnet',
            })
              .then(() => {
                // Transfer successful
              })
              .catch(() => {
                // Transfer failed
              });
          }}
        >
          Send native segwit transfer to multiple addresses
        </styled.button>
        <styled.button
          mt={3}
          onClick={() => {
            (window as any).LeatherProvider?.request('sendTransfer', {
              recipients: [
                {
                  address: 'bc1p8nyc4sl8agqfjs2rq4yer6wnhd89naw05s0ha8hpmg8j36ht6yvswqyaxm',
                  amount: '800',
                },
                {
                  address: 'bc1p8nyc4sl8agqfjs2rq4yer6wnhd89naw05s0ha8hpmg8j36ht6yvswqyaxm',
                  amount: '10000',
                },
              ],
              network: 'mainnet',
            })
              .then(() => {
                // Transfer successful
              })
              .catch(() => {
                // Transfer failed
              });
          }}
        >
          Send taproot transfer to multiple addresses
        </styled.button>
        <styled.button
          mt={3}
          onClick={() => {
            (window as any).LeatherProvider?.request('sendTransfer', {
              recipients: [
                {
                  address: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
                  amount: '10000',
                },
                {
                  address: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
                  amount: '10000',
                },
              ],
            })
              .then(() => {
                // Transfer successful
              })
              .catch(() => {
                // Transfer failed
              });
          }}
        >
          Send transfer validate error
        </styled.button>
      </div>
    </div>
  );
}
