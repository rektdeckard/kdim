export function isConstructor<T, A extends Array<unknown> = any[]>(
  value: any
): value is { new (...args: A): T } {
  try {
    new new Proxy(value, {
      construct() {
        return {};
      },
    })();
    return true;
  } catch (_) {
    return false;
  }
}
