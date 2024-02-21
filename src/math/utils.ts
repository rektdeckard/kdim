import { assertInteger, assertNatural, assertValidRange } from "./assertions";

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

/**
 * Compute the number of trailing zeros in a number's 32-bit representation,
 * equivalent to its largest power-of-two divisor.
 *
 * @param n an integer
 * @returns the number of trailing zeros in `a`'s 32-bit representation.
 */
export function trailingZeros(n: number): number {
  assertInteger(n);

  let zeros = 0;
  let x = n;

  while (true) {
    if (x === 0) break;
    if ((x & 0x1) === 0) {
      x >>= 1;
      zeros += 1;
    } else {
      break;
    }
  }

  return zeros;
}

/**
 * Find the Greatest Common Factor of two integers.
 *
 * @param a first number
 * @param b second number
 * @returns the greatest common factor of `a` and `b`
 * @throws a {@link RangeError} if non-integral arguments are provided.
 */
export function gcf(a: number, b: number): number {
  assertInteger(a, b);

  let v = Math.abs(a);
  if (b === 0) return v;

  let u = Math.abs(b);
  if (v === 0) return u;

  let powerOfTwo = trailingZeros(u | v);
  u >>= trailingZeros(u);
  v >>= trailingZeros(v);

  while (u !== v) {
    if (u < v) {
      const temp = u;
      u = v;
      v = temp;
    }
    u -= v;
    u >>= trailingZeros(u);
  }

  return u << powerOfTwo;
}

/**
 * Find the Least Common Multiple of two integers.
 *
 * @param a first number
 * @param b second number
 * @returns the least common multiple of `a` and `b`
 * @throws a {@link RangeError} if non-integral arguments are provided.
 */
export function lcm(a: number, b: number): number {
  assertInteger(a, b);
  return (a / gcf(a, b)) * b;
}
