export const initialSearchParams = new URLSearchParams(window.location.href.split('?')[1]);

export const origin = initialSearchParams.get('origin');
