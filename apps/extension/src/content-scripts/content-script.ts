/**
 Extensions that read or write to web pages utilize a content script. The content script
 contains JavaScript that executes in the contexts of a page that has been loaded into
 the browser. Content scripts read and modify the DOM of web pages the browser visits.
 https://developer.chrome.com/docs/extensions/mv3/architecture-overview/#contentScripts
 */
import type { RpcRequests, RpcResponses } from '@leather.io/rpc';

import { DomEventName } from '@shared/inpage-types';
import { CONTENT_SCRIPT_PORT } from '@shared/message-types';

import inpageScriptUrl from '../inpage/inpage?iife';

let backgroundPort: any;

// Connection to background script - fires onConnect event in background script
// and establishes two-way communication
function connect() {
  backgroundPort = chrome.runtime.connect({ name: CONTENT_SCRIPT_PORT });
  backgroundPort.onDisconnect.addListener(connect);
}

connect();

// Sends message to background script that an event has fired
function sendMessageToBackground(message: RpcRequests) {
  backgroundPort.postMessage(message);
}

// Receives message from background script to execute in browser
chrome.runtime.onMessage.addListener((message: RpcResponses) => {
  if (message.jsonrpc === '2.0') {
    window.postMessage(message, window.location.origin);
  }
});

function isRpcRequestEnvelope(value: unknown): value is RpcRequests {
  return (
    typeof value === 'object' &&
    value !== null &&
    'jsonrpc' in value &&
    value.jsonrpc === '2.0' &&
    'id' in value &&
    typeof value.id === 'string' &&
    'method' in value &&
    typeof value.method === 'string'
  );
}

document.addEventListener(DomEventName.request, (event: any) => {
  const request: unknown = event.detail;
  if (!isRpcRequestEnvelope(request)) return;
  sendMessageToBackground(request);
});

function addLeatherToPage() {
  const inpage = document.createElement('script');
  inpage.src = chrome.runtime.getURL(inpageScriptUrl);
  inpage.id = 'leather-provider';
  document.body.appendChild(inpage);
}

// Don't block thread to add Leather to page
requestAnimationFrame(() => addLeatherToPage());
