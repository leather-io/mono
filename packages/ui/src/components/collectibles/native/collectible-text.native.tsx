import { useEffect, useState } from 'react';
import WebView from 'react-native-webview';

import { fetchInscriptionTextContent } from '@leather.io/query';

import { Text } from '../../../../native';
import { CollectibleCardLayout } from './collectible-card-layout.native';

interface CollectibleTextProps {
  src: string;
  size?: number;
}

// Inscription-specific sanitizer
// TODO: pre fetch and sanitize in the service
function sanitizeInscription(html: string): string {
  // Bitcoin inscriptions are often untrusted content
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '') // Block data URLs
    .replace(/<iframe[^>]*>/gi, '<div>') // Convert iframes
    .replace(/<object[^>]*>/gi, '<div>')
    .replace(/<embed[^>]*>/gi, '<div>');
}

export function CollectibleText({ src, size = 200 }: CollectibleTextProps) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetchInscriptionTextContent(src);
        setContent(response);
      } catch {
        setContent('Content not found');
      }
    }

    void fetchContent();
  }, [src]);

  if (!content) return null;

  if (content.includes('<html')) {
    // remove any script tags
    const sanitizedHtml = sanitizeInscription(content);
    return (
      <WebView
        originWhitelist={['*']}
        source={{ html: sanitizedHtml }}
        javaScriptEnabled={false}
        domStorageEnabled={false}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
      />
    );
  }

  return (
    <CollectibleCardLayout bg="ink.text-primary" p="4" width={size} height={size}>
      <Text color="ink.background-secondary" variant="code">
        {content}
      </Text>
    </CollectibleCardLayout>
  );
}
