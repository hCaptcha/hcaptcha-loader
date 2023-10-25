import * as Sentry from '@sentry/browser';

import { ScopeTag, SentryHub } from './types';

const SENTRY_DSN = process.env.SENTRY_DSN_TOKEN;

let hub = null;

export function initSentry(
  sentry: boolean,
  scopeTag?: ScopeTag
): SentryHub | null {

  // Sentry disabled in params
  if (sentry === false) {
    return null;
  }

  // Client was already created
  if (hub) {
    return getSentryHubWrapper(hub, scopeTag);
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

  return getSentryHubWrapper(hub, scopeTag);
}

export function getSentry(): SentryHub | null {
  return getSentryHubWrapper(hub);
}

function getSentryHubWrapper(
  sentryHub,
  tag: ScopeTag = {
    key: 'source',
    value: '@hCaptcha/loader'
  }): SentryHub {

  return {
    addBreadcrumb: (breadcrumb) => sentryHub.addBreadcrumb(breadcrumb),
    captureMessage: (message) => {
      sentryHub.withScope(function (scope) {
        scope.setTag(tag.key, tag.value);

        sentryHub.captureMessage(message);
      });
    },
    captureException: (e) => {
      sentryHub.withScope(function (scope) {
        scope.setTag(tag.key, tag.value);

        sentryHub.captureException(e);
      });
    }
  };
}
