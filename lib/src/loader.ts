import { generateQuery, getFrame, getMountElement } from './utils';
import { HCAPTCHA_LOAD_FN_NAME, SCRIPT_ERROR  } from './constants';
import { initSentry } from './sentry';
import { fetchScript } from './script';

import type { ILoaderParams } from './types';

// Prevent loading API script multiple times
export const hCaptchaScripts = [];

// Generate hCaptcha API script
export function hCaptchaLoader(params: ILoaderParams = { cleanup: true }): Promise<any> {
  const sentry = initSentry(params.sentry);

  try {

    sentry?.addBreadcrumb({
      category: 'script',
      message: 'hCaptcha loader params',
      data: params,
      level: 'info'
    });

    const element = getMountElement(params.scriptLocation);
    const frame: any = getFrame(element);
    const script = hCaptchaScripts.find(({ scope }) => scope === frame.window);

    if (script) {
      sentry?.addBreadcrumb({
        category: 'script',
        message: 'hCaptcha already loaded',
        level: 'info'
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
            sentry?.addBreadcrumb({
              category: 'hCaptcha:script',
              message: 'hCaptcha script called onload function',
              level: 'info'
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
          });

          await fetchScript({ query, ...params });

          sentry?.addBreadcrumb({
            category: 'hCaptcha:script',
            message: 'hCaptcha loaded',
            level: 'info'
          });
        } catch(error) {
          sentry?.addBreadcrumb({
            category: 'hCaptcha:script',
            message: 'hCaptcha failed to load',
            level: 'info'
          });
          sentry?.captureMessage(error);
          reject(new Error(SCRIPT_ERROR));
        }
      }
    );

    hCaptchaScripts.push({ promise, scope: frame.window });

    return promise;
  } catch (e) {
    sentry?.captureException(e);
    return Promise.reject(new Error(SCRIPT_ERROR));
  }
}
