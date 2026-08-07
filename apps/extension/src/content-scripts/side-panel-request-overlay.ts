import type { RouteUrls } from '@shared/route-urls';
import { getSidePanelRequestOverlayCopy } from '@shared/utils/side-panel-request-overlay';

const sidePanelRequestOverlayId = 'leather-side-panel-request-overlay';

export function hideSidePanelRequestOverlay() {
  document.getElementById(sidePanelRequestOverlayId)?.remove();
}

export function showSidePanelRequestOverlay(path: RouteUrls) {
  hideSidePanelRequestOverlay();

  const host = document.createElement('div');
  host.id = sidePanelRequestOverlayId;
  const root = host.attachShadow({ mode: 'closed' });
  const { description, title } = getSidePanelRequestOverlayCopy(path);
  const logoUrl = chrome.runtime.getURL('assets/icons/leather-icon-128.png');

  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      box-sizing: border-box;
      padding: 24px;
      background: rgba(18, 18, 18, 0.48);
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #121212;
    }

    * {
      box-sizing: border-box;
    }

    .card {
      position: relative;
      width: min(100%, 392px);
      padding: 48px 40px 40px;
      border: 1px solid rgba(18, 18, 18, 0.08);
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 24px 80px rgba(18, 18, 18, 0.22);
      text-align: center;
      animation: leather-overlay-enter 180ms ease-out;
    }

    .logo {
      display: block;
      width: 56px;
      height: 56px;
      margin: 0 auto 24px;
      border-radius: 50%;
    }

    .title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }

    .description {
      max-width: 300px;
      margin: 10px auto 0;
      color: #6b6b6b;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.5;
    }

    .dismiss {
      position: absolute;
      top: 16px;
      right: 16px;
      display: grid;
      width: 32px;
      height: 32px;
      padding: 0;
      place-items: center;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: #6b6b6b;
      cursor: pointer;
    }

    .dismiss:hover {
      background: #f2f2f2;
      color: #121212;
    }

    .dismiss:focus-visible {
      outline: 2px solid #121212;
      outline-offset: 2px;
    }

    .dismiss svg {
      width: 18px;
      height: 18px;
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
  dismissButton.addEventListener('click', hideSidePanelRequestOverlay);

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
  root.append(style, card);
  document.documentElement.appendChild(host);
}
