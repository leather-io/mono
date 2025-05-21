# Icons

## Contents

- [Overview](#overview)
- [File Structure](#file-structure)
- [Adding New Icons](#adding-new-icons)
- [Naming Conventions](#naming-conventions)
- [Examples](#examples)

## Overview

The UI package uses a unified icon system that supports both web and native platforms. Icons are implemented as React components that wrap SVG assets, with support for different sizes and theme-based coloring.

## File Structure

Icons are organized across several directories:

```
/packages/ui/src/
├── assets/
│   └── icons/          # SVG assets
└── icons/              # React components
    ├── icon/           # Base icon components
    ├── index.native.ts # Native exports
    └── index.web.ts    # Web exports
```

## Adding New Icons

### 1. Create SVG Files

Place SVG files in `/packages/ui/src/assets/icons/`:

- Primary (required): `your-icon-24-24.svg`
- Small (optional): `your-icon-16-16.svg`

SVG specifications:

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="..." stroke="currentColor" fill="currentColor"/>
</svg>
```

### 2. Create Component Files

Create two files in `/packages/ui/src/icons/`:

1. Native Component (`your-icon-icon.native.tsx`):

```typescript
import { Component, forwardRef } from 'react';

import YourIconSmall from '../assets/icons/your-icon-16-16.svg';
import YourIcon from '../assets/icons/your-icon-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const YourIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <YourIconSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <YourIcon />
    </Icon>
  );
});
```

2. Web Component (`your-icon-icon.web.tsx`):

```typescript
import { forwardRef } from 'react';

import YourIconSmall from '../assets/icons/your-icon-16-16.svg';
import YourIcon from '../assets/icons/your-icon-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const YourIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <YourIconSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <YourIcon />
    </Icon>
  );
});
```

### 3. Update Exports

Add exports to both index files:

- `/packages/ui/src/icons/index.native.ts`
- `/packages/ui/src/icons/index.web.ts`

```typescript
export * from './your-icon-icon.native'; // or .web for web version
```

## Naming Conventions

### SVG Files

- Format: `name-size.svg`
- Examples:
  - `star-24-24.svg`
  - `star-16-16.svg`

### Component Files

- Format: `name-icon.platform.tsx`
- Examples:
  - `star-icon.native.tsx`
  - `star-icon.web.tsx`

### Component Names

- Format: `NameIcon`
- Example: `export const StarIcon = ...`

## Examples

### Complete Star Icon Example

1. SVG Files:

```
/packages/ui/src/assets/icons/star-24-24.svg
/packages/ui/src/assets/icons/star-16-16.svg
```

2. Component Files:

```
/packages/ui/src/icons/star-icon.native.tsx
/packages/ui/src/icons/star-icon.web.tsx
```

3. Usage:

```typescript
import { StarIcon } from '@leather.io/ui/native'; // or /web

// Default 24x24 size
<StarIcon />

// Small 16x16 size
<StarIcon variant="small" />
```

## Key Points

- Small (16x16) version is optional
- Both web and native implementations required
- Use `currentColor` in SVGs for theme support
- Follow existing naming patterns in the codebase
