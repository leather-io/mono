import type { Config } from '@react-router/dev/config';

// Environment variable to control SSR in PR builds
// SSR is disabled only when BUILD_TARGET is 'pull-request'
const isPullRequestBuild = process.env.BUILD_TARGET === 'pull-request';

export default {
  // Config options...
  // Server-side render by default, disabled for PR builds if BUILD_TARGET is pull-request
  ssr: !isPullRequestBuild,
  future: {
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
