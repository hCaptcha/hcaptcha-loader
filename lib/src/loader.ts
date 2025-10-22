import { generateQuery, getFrame, getMountElement } from './utils';
import { HCAPTCHA_LOAD_FN_NAME, MAX_RETRIES, SCRIPT_ERROR, SENTRY_TAG } from './constants';
import { initSentry } from './sentry';
import { fetchScript } from './script';

import type { ILoaderParams, SentryHub } from './types';

// Prevent loading API script multiple times
export const hCaptchaScripts = [];

// Generate hCaptcha API script
export function hCaptchaApi(params: ILoaderParams = { cleanup: false }, sentry: SentryHub): Promise<any> {

  try {

    sentry.addBreadcrumb({
      category: SENTRY_TAG,
      message: 'hCaptcha loader params',
      data: params,
    });

    const element = getMountElement(params.scriptLocation);
    const frame: any = getFrame(element);
    const script = hCaptchaScripts.find(({ scope }) => scope === frame.window);

    if (script) {
      sentry.addBreadcrumb({
        category: SENTRY_TAG,
        message: 'hCaptcha already loaded',
      });

      // API was already requested
      return script.promise;
    }

    const promise = new Promise(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve: (value: any) => void, reject: (value: Error) => void) => {
        try {

          // Create global onload callback for the hCaptcha library to call
          frame.window[HCAPTCHA_LOAD_FN_NAME] = () => {
            sentry.addBreadcrumb({
              category: SENTRY_TAG,
              message: 'hCaptcha script called onload function',
            });

            // Resolve loader once hCaptcha library says its ready
            resolve(frame.window.hcaptcha);
          };

          const query = generateQuery({
            custom: params.custom,
            render: params.render,
            sentry: params.sentry,
            assethost: params.assethost,
            imghost: params.imghost,
            reportapi: params.reportapi,
            endpoint: params.endpoint,
            host: params.host,
            recaptchacompat: params.recaptchacompat,
            hl: params.hl,
            uj: params.uj,
          });

          await fetchScript(
            { query, ...params },
            (src) => {
              sentry.captureRequest({
                url: src,
                method: 'GET',
              });
            });

          sentry.addBreadcrumb({
            category: SENTRY_TAG,
            message: 'hCaptcha loaded',
            data: script
          });

        } catch(error) {
          sentry.addBreadcrumb({
            category: SENTRY_TAG,
            message: 'hCaptcha failed to load',
          });


          const scriptIndex = hCaptchaScripts.findIndex(script => script.scope === frame.window);

          if (scriptIndex !== -1) {
            hCaptchaScripts.splice(scriptIndex, 1);
          }

          reject(new Error(SCRIPT_ERROR));
        }
      }
    );

    hCaptchaScripts.push({ promise, scope: frame.window });
    return promise;
  } catch (error) {
    sentry.captureException(error);
    return Promise.reject(new Error(SCRIPT_ERROR));
  }
}

export async function loadScript(params, sentry, retries = 0) {
  const message = retries < MAX_RETRIES ? 'Retry loading hCaptcha Api' : 'Exceeded maximum retries';

  try {
    return await hCaptchaApi(params, sentry);
  } catch (error) {

    sentry.addBreadcrumb({
      category: SENTRY_TAG,
      message,
    });

    if (retries >= MAX_RETRIES) {
      sentry.captureException(error);
      return Promise.reject(error);
    } else {
      retries += 1;
      return loadScript(params, sentry, retries);
    }
  }
}


export async function hCaptchaLoader(params: ILoaderParams = {}) {
  const sentry = initSentry(params.sentry);

  return await loadScript(params, sentry);
}
