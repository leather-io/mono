import { type UserConfig, defineConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  fixedExtension: false,
});

export default config;
