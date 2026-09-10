import { defineConfig } from '@pandacss/dev';

import { globalLoaderCss } from './app/layouts/nav/global-loader.styles';

const navbar = { navbar: { value: '164px' } };

export default defineConfig({
  preflight: true,

  include: ['./app/**/*.{ts,tsx}', './node_modules/@leather.io/ui/dist-web/**/*.{js,jsx,ts,tsx}'],

  globalCss: {
    ...globalLoaderCss,
    'button:not(:disabled)': { cursor: 'pointer' },
    ':root': {
      '--multisig-collecting-wash':
        'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.16), rgb(from token(colors.orange.action-primary-default) r g b / 0.025))',
      '--multisig-collecting-wash-hover':
        'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.22), rgb(from token(colors.orange.action-primary-default) r g b / 0.045))',
    },
  },

  presets: ['@leather.io/panda-preset/config'],

  jsxFramework: 'react',
  prefix: 'leather',

  outdir: 'leather-styles',

  theme: {
    tokens: {
      sizes: { ...navbar },
      spacing: { ...navbar },
    },
    extend: {
      keyframes: {
        stakingIconAttention: {
          '0%': {
            transform: 'scale(1)',
            animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          },
          '6.5%, 89.5%': {
            transform: 'scale(1.08)',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.4, 1)',
          },
          '100%': { transform: 'scale(1)' },
        },
        stakingCatScoot: {
          '0%': {
            transform: 'translateX(0) scaleX(1)',
            animationTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)',
          },
          '14%': {
            transform: 'translateX(1.5px) scaleX(0.84)',
            animationTimingFunction: 'cubic-bezier(0.55, 0, 0.85, 0.36)',
          },
          '17%': {
            transform: 'translateX(-5px) scaleX(1.3)',
            animationTimingFunction: 'cubic-bezier(0.25, 0, 0.75, 1)',
          },
          '21%, 83%': {
            transform: 'translateX(-15px) scaleX(1)',
            animationTimingFunction: 'cubic-bezier(0.3, 0, 0.5, 1)',
          },
          '86.5%': {
            transform: 'translateX(-4px) scaleX(1.25)',
            animationTimingFunction: 'cubic-bezier(0.2, 1.7, 0.4, 1)',
          },
          '94%, 100%': { transform: 'translateX(0) scaleX(1)' },
        },
        stakingLockClick: {
          '0%, 35%': {
            transform: 'translateY(0) scale(1)',
            animationTimingFunction: 'cubic-bezier(0.5, 0, 0.8, 0.4)',
          },
          '40.5%': {
            transform: 'translateY(0.6px) scale(1.05, 0.9)',
            animationTimingFunction: 'cubic-bezier(0.2, 1.6, 0.4, 1)',
          },
          '49%, 64%': {
            transform: 'translateY(0) scale(1)',
            animationTimingFunction: 'cubic-bezier(0.2, 1.6, 0.4, 1)',
          },
          '68%': {
            transform: 'translateY(-0.7px) scale(0.97, 1.05)',
            animationTimingFunction: 'cubic-bezier(0.2, 1.6, 0.4, 1)',
          },
          '76%, 100%': { transform: 'translateY(0) scale(1)' },
        },
        stakingShackleOpen: {
          '0%, 35%': {
            opacity: 1,
            transform: 'rotate(0deg)',
            animationTimingFunction: 'cubic-bezier(0.55, 0, 0.85, 0.36)',
          },
          '39.99%': { opacity: 1, transform: 'rotate(16deg)' },
          '40%, 63.99%': { opacity: 0, transform: 'rotate(16deg)' },
          '64%': {
            opacity: 1,
            transform: 'rotate(16deg)',
            animationTimingFunction: 'cubic-bezier(0.2, 1.8, 0.36, 1)',
          },
          '78%, 100%': { opacity: 1, transform: 'rotate(0deg)' },
        },
        stakingShackleClosed: {
          '0%, 39.99%': { opacity: 0 },
          '40%, 63.99%': { opacity: 1 },
          '64%, 100%': { opacity: 0 },
        },
      },
    },
  },
});
