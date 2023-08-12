export type Constructor<T, A extends Array<unknown>> = {
  new (...args: A): T;
};

export type Factory<T, A extends Array<unknown>> = (...args: A) => T;

export function isConstructor<T, A extends Array<unknown> = unknown[]>(
  ctor: T | any,
  ...testArgs: A
): ctor is Constructor<T, A> {
  try {
    new new Proxy(ctor, {
      construct() {
        return {};
      },
    })(...(testArgs ?? []));
    return true;
  } catch (_) {
    return false;
  }
}
