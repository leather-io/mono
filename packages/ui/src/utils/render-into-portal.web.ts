import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function renderIntoPortal(jsx: ReactNode, portalElementId: string) {
  const portalElement = document.getElementById(portalElementId);

  if (!portalElement) {
    throw new Error(
      `The element with ID '${portalElementId}' is required to render into a portal. Ensure it exists in index.html.`
    );
  }

  return createPortal(jsx, portalElement);
}
