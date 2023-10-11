type ValueOf<T> = T[keyof T];

interface ISpyScriptAccessors {
    get: jest.SpiedGetter<ValueOf<typeof HTMLScriptElement.prototype>>
    set: jest.SpiedSetter<ValueOf<typeof HTMLScriptElement.prototype>>
}

export function spyOnScriptMethod(method:keyof HTMLScriptElement): ISpyScriptAccessors {
  return {
    get: jest.spyOn(HTMLScriptElement.prototype, method, 'get'),
    set: jest.spyOn(HTMLScriptElement.prototype, method, 'set')
  };
}