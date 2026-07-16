import { afterEach, describe, it, expect, jest } from '@jest/globals';

import { generateQuery, getFrame, getMountElement, setContext } from '../src/utils';

const ORIGINAL_USER_AGENT = navigator.userAgent;

function getRuntimeContexts(userAgent: string) {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  });

  const setContextMock = jest.fn();
  setContext({
    setTag: jest.fn(),
    setContext: setContextMock,
  });

  return Object.fromEntries(setContextMock.mock.calls);
}

afterEach(() => {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: ORIGINAL_USER_AGENT,
  });
});

describe('generateQuery', () => {

  it('Property foo to equal bar as string foo=bar:', () => {
    const params = {
      foo: 'bar'
    };
    expect(generateQuery(params)).toBe('foo=bar');
  });

  it('Spaces to be encoded with %20', () => {
    const params = {
      foo: 'bar baz bah'
    };
    expect(generateQuery(params)).toBe('foo=bar%20baz%20bah');
  });

  it('Chain multiple parameters', () => {
    const params = {
      foo: 'bar',
      baz: true
    };
    expect(generateQuery(params)).toBe('foo=bar&baz=true');
  });

  it('false should be a valid query value', () => {
    const params = {
      foo: false
    };
    expect(generateQuery(params)).toBe('foo=false');
  });

  it('Null, undefined, and empty string values should be removed', () => {
    const params = {
      foo: '',
      bar: null,
      baz: undefined,
      bah: true
    };
    expect(generateQuery(params)).toBe('bah=true');
  });

});


describe('getFrame', () => {

  it('should return the default document and window for the root application', () => {
    const frame = getFrame();
    expect(frame.document).toEqual(document);
    expect(frame.window).toEqual(global);
  });

  it('should return the root document and window for the supplied element in the root application', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const frame = getFrame(element);
    expect(frame.document).toEqual(document);
    expect(frame.window).toEqual(global);

    // clean up
    document.body.removeChild(element);
  });

  it('should return the corresponding frame document and window for the an element found in another document', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    const frameWindow = iframe.contentWindow;
    const frameDocument = frameWindow.document;

    const element = frameDocument.createElement('div');
    frameDocument.body.appendChild(element);

    const frame = getFrame(element);
    expect(frame.document).toEqual(frameDocument);
    expect(frame.window).toEqual(frameWindow);

    expect(frame.document).not.toEqual(document);
    expect(frame.window).not.toEqual(global);

    // clean up
    document.body.removeChild(iframe);
  });

});

describe('getMountElement', () => {

  it('should return document.head by default', () => {
    const mountElement = getMountElement();
    expect(mountElement).toEqual(document.head);
  });

  it('should return element passed in', () => {
    const element = document.createElement('div');
    const mountElement = getMountElement(element);
    expect(mountElement).toEqual(element);
  });

});

describe('setContext', () => {

  it('should identify an iPhone WebView runtime', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    const contexts = getRuntimeContexts(userAgent);

    expect(contexts.os).toEqual({
      name: 'iOS',
      version: '18.0',
      UA: userAgent,
    });
    expect(contexts.browser).toEqual({
      name: 'iOS WebView',
    });
    expect(contexts.device).toEqual(expect.objectContaining({
      device: 'Mobile',
      family: 'iPhone',
      model: 'iPhone',
    }));
  });

  it('should identify an iOS in-app WebView from the v1 user-agent corpus', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone11,8;FBMD/iPhone;FBSN/iOS;FBSV/13.3.1;FBSS/2;FBID/phone;FBLC/en_US;FBOP/5;FBCR/]';
    const contexts = getRuntimeContexts(userAgent);

    expect(contexts.os).toEqual(expect.objectContaining({
      name: 'iOS',
      version: '13.3.1',
    }));
    expect(contexts.browser).toEqual({
      name: 'iOS WebView',
    });
    expect(contexts.device).toEqual(expect.objectContaining({
      device: 'Mobile',
      family: 'iPhone',
      model: 'iPhone',
    }));
  });

  it('should not identify a standalone iOS browser as a WebView', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X; zh-CN) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/15A5304i UCBrowser/11.5.7.986 Mobile AliApp(TUnionSDK/0.1.15)';
    const contexts = getRuntimeContexts(userAgent);

    expect(contexts.os).toEqual(expect.objectContaining({
      name: 'iOS',
      version: '11.0',
    }));
    expect(contexts.browser).toEqual({
      name: 'Unknown',
      version: 'Unknown',
    });
    expect(contexts.device).toEqual(expect.objectContaining({
      device: 'Mobile',
      family: 'iPhone',
      model: 'iPhone',
    }));
  });

  it('should identify an iPad WebView runtime', () => {
    const userAgent = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    const contexts = getRuntimeContexts(userAgent);

    expect(contexts.os).toEqual(expect.objectContaining({
      name: 'iOS',
      version: '18.0',
    }));
    expect(contexts.browser).toEqual({
      name: 'iOS WebView',
    });
    expect(contexts.device).toEqual(expect.objectContaining({
      device: 'Tablet',
      family: 'iPad',
      model: 'iPad',
    }));
  });

  it('should identify an Android WebView runtime', () => {
    const userAgent = 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/AP2A.240605.024; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36';
    const contexts = getRuntimeContexts(userAgent);

    expect(contexts.os).toEqual(expect.objectContaining({
      name: 'Android',
      version: '14',
    }));
    expect(contexts.browser).toEqual({
      name: 'Android WebView',
      version: '125.0.6422.165',
    });
    expect(contexts.device).toEqual(expect.objectContaining({
      device: 'Mobile',
      family: 'Android',
      model: 'Android',
    }));
  });

  it('should identify the v1 Version/ Chrome WebView pattern', () => {
    const userAgent = 'Mozilla/5.0 (Linux; Android 4.4.2; de-de; SAMSUNG GT-I9505/I9505XXUGNG8 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/1.5 Chrome/28.0.1500.94 Mobile Safari/537.36';
    const contexts = getRuntimeContexts(userAgent);

    expect(contexts.os).toEqual(expect.objectContaining({
      name: 'Android',
      version: '4.4.2',
    }));
    expect(contexts.browser).toEqual({
      name: 'Android WebView',
      version: '28.0.1500.94',
    });
    expect(contexts.device).toEqual(expect.objectContaining({
      device: 'Mobile',
      family: 'Android',
      model: 'Android',
    }));
  });

  it('should continue to identify iOS Safari', () => {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
    const contexts = getRuntimeContexts(userAgent);

    expect(contexts.os).toEqual(expect.objectContaining({
      name: 'iOS',
      version: '18.0',
    }));
    expect(contexts.browser).toEqual({
      name: 'Safari',
      version: '18.0',
    });
    expect(contexts.device).toEqual(expect.objectContaining({
      device: 'Mobile',
      family: 'iPhone',
      model: 'iPhone',
    }));
  });

  it('should continue to identify Chrome on Android', () => {
    const userAgent = 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/AP2A.240605.024) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36';
    const contexts = getRuntimeContexts(userAgent);

    expect(contexts.os).toEqual(expect.objectContaining({
      name: 'Android',
      version: '14',
    }));
    expect(contexts.browser).toEqual({
      name: 'Chrome',
      version: '125.0.6422.165',
    });
    expect(contexts.device).toEqual(expect.objectContaining({
      device: 'Mobile',
      family: 'Android',
      model: 'Android',
    }));
  });

});
