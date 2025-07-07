/**
 * Expo fingerprint configuration
 * Only includes changes that affect native builds to minimize unnecessary rebuilds
 */
module.exports = {
  // Skip source types that don't affect native builds
  sourceSkips: [
    // Skip version changes that don't affect native code
    'ExpoConfigVersions',
    'ExpoConfigRuntimeVersionIfString',
    
    // Skip package.json scripts that don't contain 'run' (build scripts)
    'PackageJsonAndroidAndIosScriptsIfNotContainRun',
  ],
  
  // Additional ignore patterns beyond .fingerprintignore
  ignorePaths: [
    // Documentation files
    '**/*.md',
    '**/README*',
    '**/CHANGELOG*',
    
    // Development and testing files
    '**/test/**',
    '**/tests/**',
    '**/__tests__/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/coverage/**',
    
    // Development configuration
    '**/tsconfig.json',
    '**/vitest.config.*',
    '**/jest.config.*',
    
    // Linting and formatting
    '**/.eslintrc*',
    '**/.prettierrc*',
    '**/prettier.config.*',
    
    // Storybook files
    '**/.storybook/**',
    '**/*.stories.*',
    
    // Development scripts
    '**/scripts/**',
    
    // Temporary files
    '**/.DS_Store',
    '**/*.log',
    
    // Environment files (except production configs)
    '**/.env.local',
    '**/.env.development',
    '**/.env.test',
  ],
};