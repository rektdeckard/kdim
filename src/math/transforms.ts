import { assertNatural, assertValidRange } from "./assertions";

/**
 * Constrain a value to within a given range, if not already within range.
 *
 * @param min The lower bound of the range (inclusive)
 * @param max The upper bound of the range (inclusive)
 * @param value The value to clamp
 * @returns The constrained value
 */
export function uncheckedClamp(
  min: number,
  max: number,
  value: number
): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Constrain a value to within a given range, if not already within range.
 *
 * @param min The lower bound of the range (inclusive)
 * @param max The upper bound of the range (inclusive)
 * @param value The value to clamp
 * @returns The constrained value
 * @throws a {@link RangeError} when range is invalid
 */
export function clamp(min: number, max: number, value: number): number {
  assertValidRange(min, max);
  return uncheckedClamp(min, max, value);
}

/**
 * Interpolate a value over a given range.
 *
 * @param from The beginning of the range
 * @param to The end of the range
 * @param value A number in which [0, 1] correstpond to the range
 * @returns The interpolated value
 */
export function uncheckedLerp(from: number, to: number, value: number): number {
  return from + (to - from) * value;
}

/**
 * Interpolate a value over a given range.
 *
 * @param from The beginning of the range
 * @param to The end of the range
 * @param value A number between 0 and 1 (inclusive) representing a point in
 * the range
 * @returns The interpolated value
 * @throws a {@link RangeError} when the value is outside of [0, 1]
 */
export function lerp(from: number, to: number, value: number): number {
  if (0 > value || value > 1)
    throw new RangeError("Value must be between 0 and 1 inclusive");

  return uncheckedLerp(from, to, value);
}

/**
 * Returns the factorial of a number
 *
 * @param n a counting number
 * @returns n!
 * @throws a {@link RangeError} when n is not a counting number
 */
export function factorial(n: number): number {
  assertNatural(n);
  if (n <= 2) return n;

  let t = n;
  let i = n;
  while (i > 1) {
    i--;
    t = t * i;
  }

  return t;
}
