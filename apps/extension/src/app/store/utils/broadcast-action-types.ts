import { Middleware, isAction } from '@reduxjs/toolkit';

export function broadcastActionTypeToOtherFramesMiddleware(): ReturnType<Middleware> {
  return function (next) {
    return function (action) {
      if (isAction(action)) void chrome.runtime.sendMessage({ method: action.type });
      return next(action);
    };
  };
}
