import { useEffect } from 'react';

import * as Linking from 'expo-linking';
import { router } from 'expo-router';

const LEATHER_PROTOCOL = 'leather';
const LEATHER_DOMAIN = 'leather.io';
const BROWSER_ROUTE = '/(tabs)/browser';

export function useDeepLinks(navigation: typeof router) {
  useEffect(() => {
    function handleUrl(rawUrl: string) {
      try {
        const parsed = new URL(rawUrl);
        const isLeatherProtocol = parsed.protocol.startsWith(LEATHER_PROTOCOL);
        const isLeatherDomain = parsed.hostname?.endsWith(LEATHER_DOMAIN);

        if (isLeatherProtocol || isLeatherDomain) {
          const target = parsed.searchParams.get('url');
          if (target) {
            navigation.navigate(`${BROWSER_ROUTE}?url=${encodeURIComponent(target)}`);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to parse deep link URL:', rawUrl, error);
      }
    }

    // Handle initial URL
    Linking.getInitialURL()
      .then(url => {
        if (url) handleUrl(url);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.warn('Failed to get initial URL:', error);
      });

    // Listen for URL changes
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, [navigation]);
}
