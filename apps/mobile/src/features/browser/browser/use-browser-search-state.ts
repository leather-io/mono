import { useReducer } from 'react';

import { formatURL } from './utils';

interface SearchBarState {
  searchUrl: string;
  textUrl: string;
}

type SearchBarAction =
  | { type: 'goToUrl'; url: string }
  | { type: 'setTextUrl'; textUrl: string }
  | { type: 'resetSearchBar' };

const initialState: SearchBarState = {
  searchUrl: 'https://leather.io',
  textUrl: 'https://leather.io',
};

function reducer(state: SearchBarState, action: SearchBarAction): SearchBarState {
  switch (action.type) {
    case 'setTextUrl': {
      return {
        ...state,
        textUrl: action.textUrl,
      };
    }
    case 'goToUrl': {
      return {
        ...state,
        textUrl: formatURL(action.url),
        searchUrl: formatURL(action.url),
      };
    }
    default:
      throw new Error('Wrong action dispatched in browser search state');
  }
}
export function useBrowserSearchState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return {
    browserSearchState: state,
    goToUrl(url: string) {
      dispatch({ type: 'goToUrl', url });
    },
    setTextUrl(textUrl: string) {
      dispatch({ type: 'setTextUrl', textUrl });
    },
  };
}
