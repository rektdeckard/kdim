import { assertInteger } from "./assertions";

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
