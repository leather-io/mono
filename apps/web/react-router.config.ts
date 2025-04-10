import type { Config } from '@react-router/dev/config';

function shouldUseSsr() {
  return process.env.BUILD_TARGET !== 'pull-request';
}

export default {
  ssr: shouldUseSsr(),
  future: {
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
