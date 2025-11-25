import { HCAPTCHA_LOAD_FN_NAME, SCRIPT_ID } from './constants';
import { getFrame, getMountElement } from './utils';

import type { IScriptParams } from './types';

export function fetchScript({
  scriptLocation,
  query,
  loadAsync = true,
  crossOrigin = 'anonymous',
  apihost = 'https://js.hcaptcha.com',
  cleanup = false,
  secureApi = false,
  scriptSource = ''
}: IScriptParams = {},
onError?: (message) => void
) {
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
        if (!secureApi && cleanup) {
          element.removeChild(script);
        }
        callback(event);
      } catch (error) {
        reject(error);
      }
    };

    script.onload = (event) => onComplete(event, resolve);
    script.onerror = (event) => {
      if (onError) {
        onError(script.src);
      }
      script?.remove();
      onComplete(event, reject);
    };

    script.src += query !== '' ? `&${query}` : '';

    element.appendChild(script);
  }
  );
}
