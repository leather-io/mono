import { colorThemes, tokens } from '@leather.io/tokens';

import type { RouteUrls } from '@shared/route-urls';
import {
  type SidePanelOverlayActionMessage,
  type SidePanelRequestOverlayVariant,
  getSidePanelRequestOverlayCopy,
  sidePanelOverlayActionMessageType,
} from '@shared/utils/side-panel-request-overlay';

const sidePanelRequestOverlayId = 'leather-side-panel-request-overlay';
const sidePanelRequestOverlayFontsId = 'leather-side-panel-request-overlay-fonts';

const bodyFont = 'LeatherOverlayDiatype';

const fallbackStack = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const light = colorThemes.base;
const dark = colorThemes.dark;

const type = {
  heading05: { size: '21px', lineHeight: '28px', weight: 500 },
  label02: { size: '15px', lineHeight: '20px', weight: 500 },
  body02: { size: '15px', lineHeight: '20px', weight: 400 },
};

function sendOverlayAction(action: SidePanelOverlayActionMessage['action']) {
  try {
    void chrome.runtime
      .sendMessage({ type: sidePanelOverlayActionMessageType, action })
      .catch(() => null);
  } catch {
    // Extension context invalidated, nothing to do from the page
  }
}

function injectOverlayFontFaces() {
  if (document.getElementById(sidePanelRequestOverlayFontsId)) return;
  const style = document.createElement('style');
  style.id = sidePanelRequestOverlayFontsId;
  style.textContent = `
    @font-face {
      font-family: '${bodyFont}';
      src: url('${chrome.runtime.getURL('assets/fonts/diatype/diatype-regular.woff2')}') format('woff2');
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: '${bodyFont}';
      src: url('${chrome.runtime.getURL('assets/fonts/diatype/diatype-medium.woff2')}') format('woff2');
      font-weight: 500;
      font-display: swap;
    }
  `;
  document.head.append(style);
}

export function hideSidePanelRequestOverlay() {
  document.getElementById(sidePanelRequestOverlayId)?.remove();
  document.getElementById(sidePanelRequestOverlayFontsId)?.remove();
}

export function showSidePanelRequestOverlay(
  path: RouteUrls,
  variant: SidePanelRequestOverlayVariant = 'pending'
) {
  hideSidePanelRequestOverlay();
  injectOverlayFontFaces();

  const host = document.createElement('div');
  host.id = sidePanelRequestOverlayId;
  const root = host.attachShadow({ mode: 'open' });
  const { cta, description, title } = getSidePanelRequestOverlayCopy(path, variant);
  const logoUrl = chrome.runtime.getURL('assets/icons/leather-icon-128.png');

  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      --leather-scrim: ${light['ink.background-overlay']};
      --leather-surface: ${light['ink.background-primary']};
      --leather-text: ${light['ink.text-primary']};
      --leather-text-subdued: ${light['ink.text-subdued']};
      --leather-action: ${light['ink.action-primary-default']};
      --leather-action-hover: ${light['ink.action-primary-hover']};
      --leather-action-label: ${light['ink.background-primary']};
      --leather-hover: ${light['ink.component-background-hover']};

      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      box-sizing: border-box;
      padding: ${tokens.spacing['space.05'].value};
      background: var(--leather-scrim);
      font-family: '${bodyFont}', ${fallbackStack};
      color: var(--leather-text);
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --leather-scrim: ${dark['ink.background-overlay']};
        --leather-surface: ${dark['ink.background-primary']};
        --leather-text: ${dark['ink.text-primary']};
        --leather-text-subdued: ${dark['ink.text-subdued']};
        --leather-action: ${dark['ink.action-primary-default']};
        --leather-action-hover: ${dark['ink.action-primary-hover']};
        --leather-action-label: ${dark['ink.background-primary']};
        --leather-hover: ${dark['ink.component-background-hover']};
      }
    }

    * {
      box-sizing: border-box;
    }

    .card {
      position: relative;
      width: min(100%, ${tokens.sizes.popupWidth.value});
      padding: ${tokens.spacing['space.07'].value} ${tokens.spacing['space.05'].value} ${tokens.spacing['space.05'].value};
      border-radius: ${tokens.radii.md.value};
      background: var(--leather-surface);
      box-shadow: hsl(206 22% 7% / 35%) 0 10px 38px -10px, hsl(206 22% 7% / 20%) 0 10px 20px -15px;
      text-align: center;
      animation: leather-overlay-enter 150ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .logo {
      display: block;
      width: ${tokens.sizes.xxl.value};
      height: ${tokens.sizes.xxl.value};
      margin: 0 auto ${tokens.spacing['space.04'].value};
      border-radius: ${tokens.radii.round.value};
    }

    .title {
      margin: 0;
      font-family: '${bodyFont}', ${fallbackStack};
      font-size: ${type.heading05.size};
      font-weight: ${type.heading05.weight};
      line-height: ${type.heading05.lineHeight};
    }

    .description {
      max-width: 34ch;
      margin: ${tokens.spacing['space.02'].value} auto 0;
      color: var(--leather-text-subdued);
      font-size: ${type.body02.size};
      font-weight: ${type.body02.weight};
      line-height: ${type.body02.lineHeight};
    }

    .cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: ${tokens.spacing['space.02'].value};
      width: 100%;
      margin: ${tokens.spacing['space.05'].value} 0 0;
      padding: ${tokens.spacing['space.03'].value} ${tokens.spacing['space.04'].value};
      border: 0;
      border-radius: ${tokens.radii.round.value};
      background: var(--leather-action);
      color: var(--leather-action-label);
      font-family: inherit;
      font-size: ${type.label02.size};
      font-weight: ${type.label02.weight};
      line-height: ${type.label02.lineHeight};
      cursor: pointer;
      transition: background 120ms ease-out;
    }

    .cta:hover {
      background: var(--leather-action-hover);
    }

    .cta-arrow {
      transition: transform 120ms ease-out;
    }

    .cta:hover .cta-arrow {
      transform: translateX(2px);
    }

    @media (prefers-reduced-motion: reduce) {
      .cta-arrow {
        transition: none;
      }
    }

    .cta:focus-visible {
      outline: 2px solid var(--leather-action);
      outline-offset: 2px;
    }

    .dismiss {
      position: absolute;
      top: ${tokens.spacing['space.03'].value};
      right: ${tokens.spacing['space.03'].value};
      display: grid;
      width: ${tokens.sizes.md.value};
      height: ${tokens.sizes.md.value};
      padding: 0;
      place-items: center;
      border: 0;
      border-radius: ${tokens.radii.round.value};
      background: transparent;
      color: var(--leather-text-subdued);
      cursor: pointer;
    }

    .dismiss:hover {
      background: var(--leather-hover);
      color: var(--leather-text);
    }

    .dismiss:focus-visible {
      outline: 2px solid var(--leather-action);
      outline-offset: 2px;
    }

    .dismiss svg {
      width: ${tokens.sizes.sm.value};
      height: ${tokens.sizes.sm.value};
    }

    @keyframes leather-overlay-enter {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .card {
        animation: none;
      }
    }
  `;

  const card = document.createElement('section');
  card.className = 'card';
  card.setAttribute('aria-labelledby', 'leather-overlay-title');
  card.setAttribute('aria-describedby', 'leather-overlay-description');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('role', 'dialog');

  const dismissButton = document.createElement('button');
  dismissButton.className = 'dismiss';
  dismissButton.type = 'button';
  dismissButton.setAttribute('aria-label', 'Dismiss');
  dismissButton.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg>';
  dismissButton.addEventListener('click', () => {
    if (variant === 'action-required') sendOverlayAction('dismiss');
    hideSidePanelRequestOverlay();
  });

  const logo = document.createElement('img');
  logo.alt = '';
  logo.className = 'logo';
  logo.src = logoUrl;

  const titleElement = document.createElement('h2');
  titleElement.className = 'title';
  titleElement.id = 'leather-overlay-title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'description';
  descriptionElement.id = 'leather-overlay-description';
  descriptionElement.textContent = description;

  card.append(dismissButton, logo, titleElement, descriptionElement);

  if (cta) {
    const ctaButton = document.createElement('button');
    ctaButton.className = 'cta';
    ctaButton.id = 'leather-overlay-cta';
    ctaButton.type = 'button';

    const ctaLabel = document.createElement('span');
    ctaLabel.textContent = cta;

    const ctaArrow = document.createElement('span');
    ctaArrow.className = 'cta-arrow';
    ctaArrow.setAttribute('aria-hidden', 'true');
    ctaArrow.textContent = '→';

    ctaButton.append(ctaLabel, ctaArrow);
    ctaButton.addEventListener('click', () => sendOverlayAction('open-panel'));
    card.append(ctaButton);
  }

  root.append(style, card);
  document.documentElement.appendChild(host);
}
