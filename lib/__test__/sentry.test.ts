import { describe, it, jest, expect, afterEach } from '@jest/globals';

import * as Sentry from '@sentry/browser';
import {
  initSentry,
  getSentry,
  getSentryHubWrapper,
} from '../src/sentry'; // Replace 'yourFileName' with the actual file name

jest.mock('@sentry/browser', () => ({
  BrowserClient: jest.fn(),
  Hub: jest.fn(),
  Breadcrumbs: jest.fn(),
  GlobalHandlers: jest.fn(),
  LinkedErrors: jest.fn(),
  Dedupe: jest.fn(),
  HttpContext: jest.fn(),
  BrowserTracing: jest.fn(),
  makeFetchTransport: jest.fn(),
  defaultStackParser: jest.fn(),
  withScope: jest.fn(),
}));

const mockScope = {
  setTag: jest.fn(),
};

describe('Sentry', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Sentry Hub and return wrapper', () => {
    const hub = initSentry(true);
    expect(Sentry.BrowserClient).toHaveBeenCalledTimes(1);
    expect(Sentry.Hub).toHaveBeenCalledTimes(1);
    expect(hub).toBeTruthy();
  });

  it('should return null if Sentry is disabled', () => {
    const hub = initSentry(false);
    expect(Sentry.BrowserClient).not.toHaveBeenCalled();
    expect(Sentry.Hub).not.toHaveBeenCalled();
    expect(hub).toBeNull();
  });

  it('should get initialized Sentry Hub', () => {
    const hub = initSentry(true);
    const hubValues = String(Object.values(hub));

    const retrievedHub = getSentry();
    const retrievedValues = String(Object.values(retrievedHub));

    expect(hubValues).toEqual(retrievedValues);
  });

  it('should wrap Sentry Hub correctly', () => {
    const mockHub = {
      addBreadcrumb: jest.fn(),
      captureMessage: jest.fn(),
      captureException: jest.fn(),
      withScope: jest.fn(callback => callback(mockScope)),
    };

    const tag = { key: 'testKey', value: 'testValue' };
    const breadcrumb = { category: 'test breadcrumb' };

    const sentryHubWrapper = getSentryHubWrapper(mockHub, tag);

    sentryHubWrapper.addBreadcrumb(breadcrumb);
    expect(mockHub.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);

    sentryHubWrapper.captureMessage('test message');
    expect(mockHub.captureMessage).toHaveBeenCalledWith('test message');

    sentryHubWrapper.captureException('test exception');
    expect(mockHub.captureException).toHaveBeenCalledWith('test exception');
  });
});

