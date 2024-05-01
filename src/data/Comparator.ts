/**
 * Represents a function used to order two values `a` and `b`. When `a` is
 * ordered before `b`, it should return a negative number. When `a` and `b`
 * are equivalent in order, it should return 0. When `a` is after `b`, it
 * should return a positive number.
 */
export type CompareFunction<V> = (a: V, b: V) => number;

/**
 * A class used to determine ordering and equality of values of a type.
 * Use one of the static comparisons to do normal or reverse ordering of
 * string and numeric primitives, or a custom {@link CompareFunction} for
 * object types and other special orderings.
 */
export class Comparator<V> {
  private _compareFn: CompareFunction<V>;

  constructor(compareFn?: CompareFunction<V>) {
    this._compareFn = compareFn ?? Comparator.lexicalCompare<V>;
  }

  static lexicalCompare<V>(a: V, b: V) {
    return a === b ? 0 : a > b ? 1 : -1;
  }

  static reverseLexicalCompare<V>(a: V, b: V) {
    return Comparator.lexicalCompare(a, b) * -1;
  }

  static numericCompare<V extends Number = number>(a: V, b: V) {
    return Number(a) - Number(b);
  }

  static reverseNumericCompare<V extends Number = number>(a: V, b: V) {
    return Comparator.numericCompare(a, b) * -1;
  }

  eq(a: V, b: V): boolean {
    return this._compareFn(a, b) === 0;
  }

  gt(a: V, b: V): boolean {
    return this._compareFn(a, b) < 0;
  }

  gte(a: V, b: V): boolean {
    return this._compareFn(a, b) <= 0;
  }

  lt(a: V, b: V): boolean {
    return this._compareFn(a, b) > 0;
  }

  lte(a: V, b: V): boolean {
    return this._compareFn(a, b) >= 0;
  }
}
