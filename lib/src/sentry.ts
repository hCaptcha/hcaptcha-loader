import * as Sentry from '@sentry/browser';

import { ScopeTag, SentryHub } from './types';
import { SCRIPT_ERROR } from './constants';

const SENTRY_DSN = process.env.SENTRY_DSN_TOKEN;

let hub = null;

export function initSentry(
  sentry: boolean,
  scopeTag?: ScopeTag
): SentryHub | null {

  // Sentry disabled in params
  if (sentry === false) {
    return getSentryHubWrapper(sentry);
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

export function getSentry(tag?: ScopeTag): SentryHub | null {
  return getSentryHubWrapper(hub, tag);
}

export function getSentryHubWrapper(
  sentryHub,
  tag: ScopeTag = {
    key: 'source',
    value: '@hCaptcha/loader'
  }): SentryHub {

  return {

    addBreadcrumb: (breadcrumb) => {
      if (!sentryHub) {
        return;
      }

      sentryHub.addBreadcrumb(breadcrumb);
    },
    captureMessage: (message) => {
      if (!sentryHub) {
        return;
      }

      sentryHub.withScope(function (scope) {
        scope.setTag(tag.key, tag.value);

        sentryHub.captureMessage(message);
      });
    },
    captureException: (error) => {
      if (!sentryHub) {
        return;
      }

      sentryHub.withScope(function (scope) {
        scope.setTag(tag.key, tag.value);
        sentryHub.captureEvent({
          message: SCRIPT_ERROR,
          level: 'error',
          extra: error
        });
      });
    }
  };
}
