import { Scope, Sentry } from '@hcaptcha/sentry';

import { RequestContext, SentryHub } from './types';
import { setContext } from './utils';

const SENTRY_DSN = process.env.SENTRY_DSN_TOKEN;
const VERSION = process.env.VERSION;
const BUILD = process.env.BUILD;

export function initSentry(sentry: boolean = true) {
  if (!sentry) {
    return getSentry();
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    release: VERSION,
    environment: BUILD
  });

  const scope = Sentry.scope;
  setContext(scope);

  return getSentry(scope);
}

function getSentry(scope: Scope | null = null): SentryHub {

  return {
    addBreadcrumb: (breadcrumb) => {
      if (!scope) {
        return;
      }
      scope.addBreadcrumb(breadcrumb);
    },
    captureRequest: (request: RequestContext) => {
      if (!scope) {
        return;
      }
      scope.setRequest(request);
    },
    captureException: (error: string | any | Error) => {
      if (!scope) {
        return;
      }
      Sentry.captureException(error, scope);
    }
  };
}
