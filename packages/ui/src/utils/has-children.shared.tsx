import { type ReactElement, type ReactNode } from 'react';

export interface HasChildren {
  children?: ReactNode;
}

export interface RequiresChildren {
  children: ReactElement | ReactElement[];
}
