import { generateQuery, getFrame, getMountElement } from './utils';
import { HCAPTCHA_LOAD_FN_NAME, RETRY_COUNT, SCRIPT_ERROR } from './constants';
import { initSentry } from './sentry';
import { fetchScript } from './script';

import type {ILoaderParams, SentryHub} from './types';

// Prevent loading API script multiple times
export const hCaptchaScripts = [];

// Generate hCaptcha API script
export function hCaptchaApi(params: ILoaderParams = { cleanup: true }, sentry: SentryHub): Promise<any> {

  try {

    sentry.addBreadcrumb({
      category: 'script',
      message: 'hCaptcha loader params',
      data: params,
    });

    const element = getMountElement(params.scriptLocation);
    const frame: any = getFrame(element);
    const script = hCaptchaScripts.find(({ scope }) => scope === frame.window);

    if (script) {
      sentry.addBreadcrumb({
        category: 'script',
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
              category: 'hCaptcha:script',
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
          });

          await fetchScript({ query, ...params });

          sentry.addBreadcrumb({
            category: 'hCaptcha:script',
            message: 'hCaptcha loaded',
          });
        } catch(error) {
          sentry.addBreadcrumb({
            category: 'hCaptcha:script',
            message: 'hCaptcha failed to load',
          });
          sentry.captureException(error);
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

export function loadScript(params, retries = 0) {
  const message = retries < RETRY_COUNT ? 'Retry loading hCaptcha Api' : 'Exceeded maximum retries';
  const category = 'api';

  const sentry = initSentry(params.sentry);

  try {

    return hCaptchaApi(params, sentry);

  } catch (error) {

    sentry.addBreadcrumb({
      category,
      message,
      data: { error: error.message }
    });

    if (retries >= RETRY_COUNT) {
      sentry.captureException(error);
      return Promise.reject(error);
    } else {
      retries += 1;
      return loadScript(params, retries);
    }
  }
}


export function hCaptchaLoader(params) {
  return loadScript(params);
}
