/**
 * Utility functions for version comparison and validation
 */

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Parse a semantic version string into components
 * @param version - Version string (e.g., "2.57.0")
 * @returns Parsed version components
 * @throws Error if version format is invalid
 */
export function parseSemanticVersion(version: string): SemanticVersion {
  if (!version || typeof version !== 'string') {
    throw new Error('Version must be a non-empty string');
  }

  const parts = version.split('.');
  if (parts.length < 2 || parts.length > 3) {
    throw new Error('Version must be in format x.y or x.y.z');
  }

  const major = parseInt(parts[0] || '0', 10);
  const minor = parseInt(parts[1] || '0', 10);
  const patch = parts[2] ? parseInt(parts[2], 10) : 0;

  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    throw new Error('Version components must be numeric');
  }

  if (major < 0 || minor < 0 || patch < 0) {
    throw new Error('Version components must be non-negative');
  }

  return { major, minor, patch };
}

/**
 * Check if a version string is valid semantic version format
 * @param version - Version string to validate
 * @returns true if version follows semantic versioning pattern
 */
export function isValidVersion(version: string): boolean {
  if (!version || typeof version !== 'string') {
    return false;
  }

  try {
    parseSemanticVersion(version);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compare two semantic version strings
 * @param currentVersion - The current app version (e.g., "2.57.0")
 * @param minimumVersion - The minimum required version (e.g., "2.58.0")
 * @returns true if current version is less than minimum version (needs update)
 */
export function isVersionLessThan(currentVersion: string, minimumVersion: string): boolean {
  // Handle edge cases
  if (!currentVersion || !minimumVersion) return false;
  if (currentVersion === minimumVersion) return false;

  try {
    const current = parseSemanticVersion(currentVersion);
    const minimum = parseSemanticVersion(minimumVersion);

    // Compare major.minor.patch
    if (current.major < minimum.major) return true;
    if (current.major > minimum.major) return false;

    if (current.minor < minimum.minor) return true;
    if (current.minor > minimum.minor) return false;

    if (current.patch < minimum.patch) return true;

    return false; // Versions are equal or current is greater
  } catch {
    // If either version is invalid, assume no update needed
    return false;
  }
}
