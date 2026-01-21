import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getFilesToUpdate, hexToRgb, updateLottieMetadata } from './sync-lottie-colors.js';

describe('sync-lottie-colors', () => {
  describe('hexToRgb', () => {
    test('should convert hex color with # prefix to RGB', () => {
      const result = hexToRgb('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('should convert hex color without # prefix to RGB', () => {
      const result = hexToRgb('FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('should handle lowercase hex colors', () => {
      const result = hexToRgb('#ff0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('should handle uppercase hex colors', () => {
      const result = hexToRgb('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('should handle mixed case hex colors', () => {
      const result = hexToRgb('#Ff00Aa');
      expect(result).toEqual({ r: 255, g: 0, b: 170 });
    });

    test('should convert light theme token color correctly', () => {
      // ink.text-primary from light theme: #12100F
      const result = hexToRgb('#12100F');
      expect(result).toEqual({ r: 18, g: 16, b: 15 });
    });

    test('should convert dark theme token color correctly', () => {
      // ink.text-non-interactive from dark theme: #9E9996
      const result = hexToRgb('#9E9996');
      expect(result).toEqual({ r: 158, g: 153, b: 150 });
    });

    test('should convert pure white', () => {
      const result = hexToRgb('#FFFFFF');
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    test('should convert pure black', () => {
      const result = hexToRgb('#000000');
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    test('should throw error for invalid hex color with letters beyond F', () => {
      expect(() => hexToRgb('#GGG000')).toThrow('Invalid hex color: #GGG000');
    });

    test('should throw error for too short hex color', () => {
      expect(() => hexToRgb('#12')).toThrow('Invalid hex color: #12');
    });

    test('should throw error for too long hex color', () => {
      expect(() => hexToRgb('#1234567')).toThrow('Invalid hex color: #1234567');
    });

    test('should throw error for non-hex string', () => {
      expect(() => hexToRgb('notahex')).toThrow('Invalid hex color: notahex');
    });

    test('should throw error for empty string', () => {
      expect(() => hexToRgb('')).toThrow('Invalid hex color: ');
    });
  });

  describe('getFilesToUpdate', () => {
    test('should return correct file mappings for light and dark themes', () => {
      const mockColorThemes = {
        base: {
          'ink.text-primary': '#12100F',
        },
        dark: {
          'ink.text-non-interactive': '#9E9996',
        },
      };

      const files = getFilesToUpdate(mockColorThemes);

      expect(files).toHaveLength(4);
      expect(files).toEqual([
        {
          path: 'lottie-splash-screen-light.json',
          colorToken: '#12100F',
          theme: 'light',
        },
        {
          path: 'lottie-locked-splash-screen-light.json',
          colorToken: '#12100F',
          theme: 'light',
        },
        {
          path: 'lottie-splash-screen-dark.json',
          colorToken: '#9E9996',
          theme: 'dark',
        },
        {
          path: 'lottie-locked-splash-screen-dark.json',
          colorToken: '#9E9996',
          theme: 'dark',
        },
      ]);
    });

    test('should use light theme token for light files', () => {
      const mockColorThemes = {
        base: {
          'ink.text-primary': '#LIGHT1',
        },
        dark: {
          'ink.text-non-interactive': '#DARK01',
        },
      };

      const files = getFilesToUpdate(mockColorThemes);
      const lightFiles = files.filter(f => f.theme === 'light');

      expect(lightFiles).toHaveLength(2);
      lightFiles.forEach(file => {
        expect(file.colorToken).toBe('#LIGHT1');
      });
    });

    test('should use dark theme token for dark files', () => {
      const mockColorThemes = {
        base: {
          'ink.text-primary': '#LIGHT1',
        },
        dark: {
          'ink.text-non-interactive': '#DARK01',
        },
      };

      const files = getFilesToUpdate(mockColorThemes);
      const darkFiles = files.filter(f => f.theme === 'dark');

      expect(darkFiles).toHaveLength(2);
      darkFiles.forEach(file => {
        expect(file.colorToken).toBe('#DARK01');
      });
    });

    test('should include all expected file names', () => {
      const mockColorThemes = {
        base: { 'ink.text-primary': '#000000' },
        dark: { 'ink.text-non-interactive': '#FFFFFF' },
      };

      const files = getFilesToUpdate(mockColorThemes);
      const filePaths = files.map(f => f.path);

      expect(filePaths).toContain('lottie-splash-screen-light.json');
      expect(filePaths).toContain('lottie-splash-screen-dark.json');
      expect(filePaths).toContain('lottie-locked-splash-screen-light.json');
      expect(filePaths).toContain('lottie-locked-splash-screen-dark.json');
    });
  });

  describe('updateLottieMetadata', () => {
    test('should add backgroundColor to metadata when metadata exists', () => {
      const lottieJson = {
        v: '5.7.5',
        metadata: { someOtherField: 'value' },
        layers: [],
      };

      const result = updateLottieMetadata(lottieJson, '#FF0000');

      expect(result.metadata.backgroundColor).toEqual({ r: 255, g: 0, b: 0 });
      expect(result.metadata.someOtherField).toBe('value');
    });

    test('should create metadata object if it does not exist', () => {
      const lottieJson = {
        v: '5.7.5',
        layers: [],
      };

      const result = updateLottieMetadata(lottieJson, '#FF0000');

      expect(result.metadata).toBeDefined();
      expect(result.metadata.backgroundColor).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('should preserve other Lottie JSON properties', () => {
      const lottieJson = {
        v: '5.7.5',
        fr: 100,
        ip: 0,
        op: 200,
        w: 390,
        h: 844,
        nm: 'Comp 1',
        ddd: 0,
        layers: [{ id: 1 }],
        assets: [{ id: '0' }],
      };

      const result = updateLottieMetadata(lottieJson, '#12100F');

      // Verify all original properties are preserved
      expect(result.v).toBe('5.7.5');
      expect(result.fr).toBe(100);
      expect(result.ip).toBe(0);
      expect(result.op).toBe(200);
      expect(result.w).toBe(390);
      expect(result.h).toBe(844);
      expect(result.nm).toBe('Comp 1');
      expect(result.ddd).toBe(0);
      expect(result.layers).toEqual([{ id: 1 }]);
      expect(result.assets).toEqual([{ id: '0' }]);
    });

    test('should update existing backgroundColor', () => {
      const lottieJson = {
        v: '5.7.5',
        metadata: {
          backgroundColor: { r: 113, g: 106, b: 96 }, // Old wrong color
        },
        layers: [],
      };

      const result = updateLottieMetadata(lottieJson, '#9E9996');

      expect(result.metadata.backgroundColor).toEqual({ r: 158, g: 153, b: 150 });
    });

    test('should handle light theme color correctly', () => {
      const lottieJson = {
        v: '5.7.5',
        layers: [],
      };

      const result = updateLottieMetadata(lottieJson, '#12100F');

      expect(result.metadata.backgroundColor).toEqual({ r: 18, g: 16, b: 15 });
    });

    test('should handle dark theme color correctly', () => {
      const lottieJson = {
        v: '5.7.5',
        layers: [],
      };

      const result = updateLottieMetadata(lottieJson, '#9E9996');

      expect(result.metadata.backgroundColor).toEqual({ r: 158, g: 153, b: 150 });
    });

    test('should not modify the original object reference', () => {
      const lottieJson = {
        v: '5.7.5',
        layers: [],
      };

      const result = updateLottieMetadata(lottieJson, '#FF0000');

      // The function modifies in place, so they should be the same reference
      expect(result).toBe(lottieJson);
    });
  });

  describe('regression tests', () => {
    test('should detect the "hat" bug - wrong dark mode color', () => {
      // The original bug: dark mode had rgb(113, 106, 96) instead of rgb(158, 153, 150)
      const wrongColor = hexToRgb('#716A60'); // 113, 106, 96
      const correctColor = hexToRgb('#9E9996'); // 158, 153, 150

      expect(wrongColor).not.toEqual(correctColor);
      expect(correctColor).toEqual({ r: 158, g: 153, b: 150 });
    });

    test('should verify correct token mappings prevent color mismatches', () => {
      const mockColorThemes = {
        base: {
          'ink.text-primary': '#12100F',
        },
        dark: {
          'ink.text-non-interactive': '#9E9996',
        },
      };

      const files = getFilesToUpdate(mockColorThemes);

      // Verify light files use the correct token
      const lightFiles = files.filter(f => f.theme === 'light');
      lightFiles.forEach(file => {
        const rgb = hexToRgb(file.colorToken);
        expect(rgb).toEqual({ r: 18, g: 16, b: 15 });
      });

      // Verify dark files use the correct token (not the old wrong color)
      const darkFiles = files.filter(f => f.theme === 'dark');
      darkFiles.forEach(file => {
        const rgb = hexToRgb(file.colorToken);
        expect(rgb).toEqual({ r: 158, g: 153, b: 150 });
        // Ensure it's NOT the old wrong color
        expect(rgb).not.toEqual({ r: 113, g: 106, b: 96 });
      });
    });
  });
});
