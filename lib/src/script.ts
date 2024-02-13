import { HCAPTCHA_LOAD_FN_NAME, SCRIPT_ID } from './constants';
import { getFrame, getMountElement } from './utils';

import type { IScriptParams } from './types';

export function fetchScript({
  scriptLocation,
  query,
  loadAsync = true,
  crossOrigin,
  apihost = 'https://js.hcaptcha.com',
  cleanup = true,
  secureApi = false,
  scriptSource = ''
}: IScriptParams = {}) {
  const element = getMountElement(scriptLocation);
  const frame: any = getFrame(element);

  return new Promise((resolve, reject) => {
    const script = frame.document.createElement('script');

    script.id = SCRIPT_ID;
    if (scriptSource) {
      script.src = `${scriptSource}?onload=${HCAPTCHA_LOAD_FN_NAME}`;
    } else {
      if (secureApi) {
        script.src = `${apihost}/1/secure-api.js?onload=${HCAPTCHA_LOAD_FN_NAME}`;
      } else {
        script.src = `${apihost}/1/api.js?onload=${HCAPTCHA_LOAD_FN_NAME}`;
      }
    }
    script.crossOrigin = crossOrigin;
    script.async = loadAsync;

    const onComplete = (event, callback) => {
      try {
        if (cleanup) {
          element.removeChild(script);
        }
        callback(event);
      } catch (error) {
        reject(error);
      }
    };

    script.onload = (event) => onComplete(event, resolve);
    script.onerror = (event) => onComplete(event, reject);

    script.src += query !== '' ? `&${query}` : '';

    element.appendChild(script);
  }
  );
}
