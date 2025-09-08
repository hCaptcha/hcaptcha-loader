import { afterEach, afterAll, beforeAll, describe, it, jest, expect } from '@jest/globals';
import { spyOnScriptMethod } from './__mocks__';

import { fetchScript } from '../src/script';
import { HCAPTCHA_LOAD_FN_NAME, SCRIPT_ERROR, SCRIPT_ID } from '../src/constants';
import { generateQuery } from '../src/utils';


type Node = HTMLScriptElement;

function removeNode(node: Node, nodes: Node[]) {
  let i = nodes.length;
  let found = false;
  while (--i > -1 && !found) {
    found = nodes[i] === node;
    if (found) {
      nodes.splice(i, 1);
    }
  }
  return node;
}

function cleanupNodes(nodes: Node[]) {
  let i = nodes.length;
  while (--i > -1) {
    nodes.splice(i, 1);
  }
}

describe('fetchScript', () => {
  const nodes: Node[] = [];

  const spyOnAppend = jest.spyOn(document.head, 'appendChild')
    .mockImplementation((node: Node): Node => {
      nodes.push(node);
      return node;
    });

  const spyOnRemove = jest.spyOn(document.head, 'removeChild')
    .mockImplementation(node => removeNode(node as any, nodes));


  const spyOnLoad = spyOnScriptMethod('onload');
  const spyOnError = spyOnScriptMethod('onerror');

  describe('load', () => {

    afterEach(() => {
      cleanupNodes(nodes);
    });

    it('should resolve when onload is called', async () => {
      const eventOnLoad = new Event('Loaded Script');

      spyOnLoad.set.mockImplementationOnce((callback: (any) => void) => {
        callback(eventOnLoad);
      });

      await expect(fetchScript()).resolves.toBe(eventOnLoad);

      expect(spyOnAppend).toHaveBeenCalled();
      expect(spyOnRemove).not.toHaveBeenCalled();
    });

    it('should reject when onerror is called', async () => {
      spyOnError.set.mockImplementationOnce((callback: (any) => any) => {
        callback('Invalid Script');
      });

      await expect(fetchScript()).rejects.toBe('Invalid Script');

      expect(spyOnAppend).toHaveBeenCalled();
      expect(spyOnRemove).not.toHaveBeenCalled();
    });

    it('should reject when cleanup script encounters internal error', async () => {
      const errorInternal = new Error(SCRIPT_ERROR);

      spyOnLoad.set.mockImplementationOnce((callback: (any) => void) => {
        callback(new Event('Loaded Script'));
      });

      spyOnRemove.mockImplementationOnce(() => { throw errorInternal; });

      await expect(fetchScript({ cleanup: true })).rejects.toThrow(errorInternal.message);
    });

  });

  describe('setup', () => {
    beforeAll(() => {
      const eventOnLoad = new Event('Loaded Script');

      spyOnLoad.set.mockImplementation((callback: (any) => void) => {
        callback(eventOnLoad);
      });
    });

    afterEach(() => {
      cleanupNodes(nodes);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should set default parameters', async () => {
      await fetchScript();

      const [script] = nodes;
      expect(script.src).toMatch('https://js.hcaptcha.com/1/api.js');
      expect(script.async).toBeTruthy();
      expect(script.crossOrigin).toEqual('anonymous');
      expect(script.id).toEqual(SCRIPT_ID);
    });

    it('should set query parameters', async () => {
      const query = generateQuery({ custom: true, render: 'explicit', sentry: false });
      await fetchScript({ query });

      const [script] = nodes;
      expect(script.src).toMatch(`https://js.hcaptcha.com/1/api.js?onload=${HCAPTCHA_LOAD_FN_NAME}&${query}`);
    });

    it('should not set async when loadAsync is passed in as false', async () => {
      await fetchScript({ loadAsync:false });

      const [script] = nodes;
      expect(script.async).toBeFalsy();
    });


    it('should set crossOrigin when it is passed in', async () => {
      await fetchScript({ crossOrigin: 'anonymous' });

      const [script] = nodes;
      expect(script.crossOrigin).toEqual('anonymous');
    });

    it('should change hCaptcha JS domain if apihost is specified', async () => {
      const apihost = 'https://example.com';
      await fetchScript({ apihost });

      const [script] = nodes;
      expect(script.src).toMatch(`${apihost}/1/api.js?onload=${HCAPTCHA_LOAD_FN_NAME}`);
    });

    it('should change hCaptcha JS API if secureApi is specified', async () => {
      const secureApi = true;
      await fetchScript({ secureApi });

      const [script] = nodes;
      expect(script.src).toMatch(`https://js.hcaptcha.com/1/secure-api.js?onload=${HCAPTCHA_LOAD_FN_NAME}`);
    });

    it('should change hCaptcha JS API if scriptSource is specified', async () => {
      const scriptSource = 'hcaptcha.com/1/api.js';
      await fetchScript({ scriptSource });

      const [script] = nodes;
      expect(script.src).toMatch(`${scriptSource}?onload=${HCAPTCHA_LOAD_FN_NAME}`);
    });
  });

  describe('cleanup', () => {

    beforeAll(() => {
      const eventOnLoad = new Event('Loaded Script');

      spyOnLoad.set.mockImplementation((callback: (any) => void) => {
        callback(eventOnLoad);
      });
    });

    afterEach(() => {
      cleanupNodes(nodes);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should not remove script node by default', async () => {
      await fetchScript();
      const element = document.getElementById(SCRIPT_ID);
      expect(element).toBeDefined();
    });

    it('should remove script node if clean is set to true', async () => {
      await fetchScript({ cleanup: true });
      const element = document.getElementById(SCRIPT_ID);
      expect(element).toBeNull();
    });

    it('should not remove script node if clean is set to false', async () => {
      await fetchScript({ cleanup: false });
      const element = document.getElementById(SCRIPT_ID);
      expect(element).toBeDefined();
    });
  });
});
