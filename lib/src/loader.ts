import { generateQuery, getFrame, getMountElement } from './utils';
import { HCAPTCHA_LOAD_FN_NAME, SCRIPT_ERROR  } from './constants';
import { initSentry } from './sentry';
import { fetchScript } from './script';

import type { ILoaderParams, SentryHub, AttemptLoadingParams } from './types';

// Prevent loading API script multiple times
export const hCaptchaScripts = [];

// Generate hCaptcha API script
export function hCaptchaLoaderPromise(params: ILoaderParams = { cleanup: true }, sentry: SentryHub): Promise<any> {

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


export function hCaptchaLoader(params: ILoaderParams = { cleanup: true }) {
  const retryCount = 3;
  const sentry = initSentry(params.sentry);

  function handleError({ resolve, reject, retries, error }: AttemptLoadingParams) {
    sentry.addBreadcrumb({
      category: 'hCaptcha:retry',
      message: 'Retrying hCaptchaLoaderPromise',
      data: { retries: retries + 1, error: error.message }
    });

    return attemptLoading({ resolve, reject, retries: retries +1, error });
  }

  function attemptLoading({ resolve, reject, retries, error = {} }: AttemptLoadingParams) {
    if (retries >= retryCount) {
      sentry.addBreadcrumb({
        category: 'hCaptcha:retry',
        message: 'Exceeded maximum retries',
        data: { error: error.message }
      });
      sentry.captureException(error);
      return reject(error);
    }

    hCaptchaLoaderPromise(params, sentry)
      .then((result) => resolve(result), (error) =>
        handleError({ error, resolve, reject, retries }))
      .catch(error => handleError({ error, resolve, reject, retries }));
  }

  return new Promise((resolve, reject) => {
    return attemptLoading({resolve, reject, retries: 0});
  });
}
