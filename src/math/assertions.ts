/**
 * Assert that the arguments constitute a valid range, in which
 * `min < max`, and, if present, `min <= value && value <= max`.
 *
 * @param min the lower bound of the range (inclusive)
 * @param max the upper bound of the range (inclusive)
 * @param value the optional value
 * @throws a {@link RangeError} when range or value is invalid
 */
export function assertValidRange(min: number, max: number, value?: number) {
  if (min > max) throw new RangeError("Minimum must be less than maximum");
  if (typeof value === "undefined") return;
  if (min > value || value > max)
    throw new RangeError("Value must be between minimum and maximum");
}

/**
 * Assert that the arguments are all integers.
 *
 * @param numbers a list of numbers
 * @throws a {@link RangeError} when any number has a fractional part
 */
export function assertInteger(...numbers: number[]) {
  if (numbers.some((n) => !Number.isInteger(n)))
    throw new RangeError("Arguments must be integers");
}

/**
 * Assert that the arguments are all natural numbers.
 *
 * @param numbers a list of numbers
 * @throws a {@link RangeError} when any number is below zero or has a
 * fractional part
 */
export function assertNatural(...numbers: number[]) {
  if (numbers.some((n) => n < 0 || !Number.isInteger(n)))
    throw new RangeError("Arguments must be natural numbers");
}

/**
 * Assert that the arguments are all natural numbers.
 *
 * @param numbers a list of numbers
 * @throws a {@link RangeError} when any number is below 1 or has a
 * fractional part
 */
export function assertCounting(...numbers: number[]) {
  if (numbers.some((n) => n < 1 || !Number.isInteger(n)))
    throw new RangeError("Arguments must be counting numbers");
}

/**
 * Assert that the argument is or is assignable to an integral {@link Number}
 * type, and downcast it to a primitive.
 *
 * @param n a numeric type (note: though constrained in type, will not prevent
 * passing a type convertable with `Number()` in plain JavaScript.
 * @returns  a primitive integer
 * @throws when encounters numeric arguments with a fractional component,
 * or when outside of safe integer range.
 */
export function castInteger<N extends Number>(n: N): number {
  const coerced = typeof n === "number" ? n : Number(n);
  if (!Number.isSafeInteger(coerced))
    throw new RangeError("Values must be safe integers");

  return coerced.valueOf();
}
