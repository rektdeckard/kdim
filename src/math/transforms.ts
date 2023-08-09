import { assertValidRange } from "./assertions";

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
 * @param min the lower bound of the range (inclusive)
 * @param max the upper bound of the range (inclusive)
 * @param value the value to clamp
 * @returns the constrained value
 * @throws a {@link RangeError} when range is invalid
 */
export function clamp(min: number, max: number, value: number): number {
  assertValidRange(min, max);
  return uncheckedClamp(min, max, value);
}

/**
 * Interpolate a value over a given range.
 *
 * @param start the beginning of the range
 * @param end the end of the range
 * @param value a number between 0 and 1 (inclusive) representing a point in
 * the range
 * @returns the interpolated value
 * @throws a {@link RangeError} when the value is outside of [0, 1]
 */
export function lerp(start: number, end: number, value: number): number {
  if (0 > value || value > 1)
    throw new RangeError("Value must be between 0 and 1 inclusive");

  return start + (end - start) * value;
}
