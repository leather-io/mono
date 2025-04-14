import type { Config } from '@react-router/dev/config';
import { sentryOnBuildEnd } from '@sentry/react-router';

// eslint-disable-next-line func-style
const buildEnd: Config['buildEnd'] = async ({ viteConfig, reactRouterConfig, buildManifest }) => {
  await sentryOnBuildEnd({ viteConfig, reactRouterConfig, buildManifest });
};

export default {
  ssr: true,
  future: {
    unstable_viteEnvironmentApi: true,
  },
  // Hack to get around non-portable type export of `FutureConfig`
  buildEnd: buildEnd as unknown as Config['buildEnd'],
} satisfies Config;
