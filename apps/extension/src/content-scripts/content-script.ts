/**
 Extensions that read or write to web pages utilize a content script. The content script
 contains JavaScript that executes in the contexts of a page that has been loaded into
 the browser. Content scripts read and modify the DOM of web pages the browser visits.
 https://developer.chrome.com/docs/extensions/mv3/architecture-overview/#contentScripts
 */
import { z } from 'zod/mini';

import type { RpcResponses } from '@leather.io/rpc';

import { DomEventName } from '@shared/inpage-types';
import { CONTENT_SCRIPT_PORT } from '@shared/message-types';

const inpageScriptUrl = 'inpage.js';

const rpcRequestEnvelopeSchema = z.looseObject({
  jsonrpc: z.literal('2.0'),
  id: z.string(),
  method: z.string(),
});
type RpcRequestEnvelope = z.infer<typeof rpcRequestEnvelopeSchema>;

let backgroundPort: chrome.runtime.Port;

// Connection to background script - fires onConnect event in background script
// and establishes two-way communication
function connect() {
  backgroundPort = chrome.runtime.connect({ name: CONTENT_SCRIPT_PORT });
  backgroundPort.onDisconnect.addListener(connect);
}

connect();

// Sends message to background script that an event has fired
function sendMessageToBackground(message: RpcRequestEnvelope) {
  backgroundPort.postMessage(message);
}

// Receives message from background script to execute in browser
chrome.runtime.onMessage.addListener((message: RpcResponses) => {
  if (message.jsonrpc === '2.0') {
    window.postMessage(message, window.location.origin);
  }
});

document.addEventListener(DomEventName.request, (event: Event) => {
  const request: unknown = 'detail' in event ? event.detail : undefined;
  const parsedRequest = rpcRequestEnvelopeSchema.safeParse(request);
  if (!parsedRequest.success) return;
  sendMessageToBackground(parsedRequest.data);
});

function addLeatherToPage() {
  const inpage = document.createElement('script');
  inpage.src = chrome.runtime.getURL(inpageScriptUrl);
  inpage.id = 'leather-provider';
  document.body.appendChild(inpage);
}

// Don't block thread to add Leather to page
requestAnimationFrame(() => addLeatherToPage());
