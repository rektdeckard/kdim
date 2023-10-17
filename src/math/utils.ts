import { assertInteger } from "./assertions";

export function trailingZeros(n: number): number {
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

export function lcm(a: number, b: number): number {
  assertInteger(a, b);
  return (a / gcf(a, b)) * b;
}
