#!/usr/bin/env node
/**
 * Syncs Lottie animation background colors with design tokens
 * This ensures the Lottie files always match the current theme colors
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import color themes from tokens package
// We need to read the compiled JS from the dist folder
async function getColorThemes() {
  try {
    const { colorThemes } = await import('@leather.io/tokens');
    return colorThemes;
  } catch (error) {
    console.error('Failed to import @leather.io/tokens:', error);
    console.error('Make sure the tokens package is built: pnpm -w build');
    process.exit(1);
  }
}

// Exported for testing
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

const ASSETS_DIR = join(__dirname, '..', 'src', 'assets');

// Exported for testing
export function getFilesToUpdate(colorThemes) {
  return [
    {
      path: 'lottie-splash-screen-light.json',
      colorToken: colorThemes.base['ink.text-primary'],
      theme: 'light',
    },
    {
      path: 'lottie-locked-splash-screen-light.json',
      colorToken: colorThemes.base['ink.text-primary'],
      theme: 'light',
    },
    {
      path: 'lottie-splash-screen-dark.json',
      colorToken: colorThemes.dark['ink.text-non-interactive'],
      theme: 'dark',
    },
    {
      path: 'lottie-locked-splash-screen-dark.json',
      colorToken: colorThemes.dark['ink.text-non-interactive'],
      theme: 'dark',
    },
  ];
}

// Exported for testing
export function updateLottieMetadata(lottieJson, backgroundColor) {
  const rgb = hexToRgb(backgroundColor);

  // Update or create metadata with background color
  if (!lottieJson.metadata) {
    lottieJson.metadata = {};
  }
  lottieJson.metadata.backgroundColor = rgb;

  return lottieJson;
}

function syncLottieBackgroundColor(filePath, backgroundColor, theme) {
  const fullPath = join(ASSETS_DIR, filePath);

  try {
    const content = readFileSync(fullPath, 'utf-8');
    const lottie = JSON.parse(content);

    const updatedLottie = updateLottieMetadata(lottie, backgroundColor);

    // Write back with pretty formatting
    writeFileSync(fullPath, JSON.stringify(updatedLottie, null, 2) + '\n', 'utf-8');

    const rgb = updatedLottie.metadata.backgroundColor;
    console.log(
      `✓ Updated ${filePath} (${theme}): rgb(${rgb.r}, ${rgb.g}, ${rgb.b}) from token ${backgroundColor}`
    );
  } catch (error) {
    console.error(`✗ Failed to update ${filePath}:`, error);
    process.exit(1);
  }
}

async function main() {
  console.log('🎨 Syncing Lottie animation colors with design tokens...\n');

  const colorThemes = await getColorThemes();
  const filesToUpdate = getFilesToUpdate(colorThemes);

  for (const file of filesToUpdate) {
    syncLottieBackgroundColor(file.path, file.colorToken, file.theme);
  }

  console.log('\n✨ All Lottie files synced successfully!');
  console.log(
    '\n📝 Note: These files are auto-generated. To update colors, modify @leather.io/tokens'
  );
}

// Only run main if this is the entry point (not imported for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
