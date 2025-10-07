import { ReactElement, ReactNode } from 'react';

export interface HasChildren {
  children?: ReactNode;
}

export interface RequiresChildren {
  children: ReactElement | ReactElement[];
}
