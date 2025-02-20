'use client';

import { ReactNode } from 'react';

export function Section({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-2 border-neutral-500 rounded-md p-2 max-w-[80vw] overflow-hidden">
      {children}
    </div>
  );
}
