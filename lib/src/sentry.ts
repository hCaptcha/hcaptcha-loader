import * as Sentry from '@sentry/browser';

import { SentryHub } from './types';

const SENTRY_DSN = process.env.SENTRY_DSN_TOKEN;

let hub = null;

export function initSentry(sentry: boolean): SentryHub | null {

  // Sentry disabled in params
  if (sentry === false) {
    return null;
  }

  // Client was already created
  if (hub) {
    return getSentryHubWrapper(hub);
  }

  const client = new Sentry.BrowserClient({
    dsn: SENTRY_DSN,
    transport: Sentry.makeFetchTransport,
    stackParser: Sentry.defaultStackParser,
    integrations: [
      new Sentry.Breadcrumbs(),
      new Sentry.GlobalHandlers(),
      new Sentry.LinkedErrors(),
      new Sentry.Dedupe(),
      new Sentry.HttpContext(),
      new Sentry.BrowserTracing(),
    ],
  });

  hub = new Sentry.Hub(client);
  return getSentryHubWrapper(hub);
}

export function getSentry(): SentryHub | null {
  return getSentryHubWrapper(hub);
}

function setScopeTag(value: string = '@hCaptcha/loader', key: string = 'source') {
  hub?.configureScope(function(scope) {
    scope.setTag(key, value);
  });
}

function getSentryHubWrapper(sentryHub): SentryHub | null {
  return {
    captureMessage: (message) => sentryHub.captureMessage(message),
    captureException: (params) => sentryHub.captureException(params),
    addBreadcrumb: (params) => sentryHub.addBreadcrumb(params),
    setTag: (source) => setScopeTag(source),
  };
}
