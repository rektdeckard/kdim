/**
 * PRNG implementations adapted from GitHub user bryce
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */

import {
  assertCounting,
  assertInteger,
  assertNatural,
  assertValidRange,
} from "./assertions";
import {
  U8_MAX,
  U16_MAX,
  U32_MAX,
  I8_MIN,
  I16_MIN,
  I32_MIN,
  I32_MAX,
} from "./constants";
import { factorial, lerp } from "./utils";
import type { BoundedOptions } from "./types";
import type { Vec } from "../types";

export interface PRNG {
  bool(): boolean;
  natural(max?: number): number;
  counting(max?: number): number;
  u8(): number;
  u16(): number;
  u32(): number;
  i8(): number;
  i16(): number;
  i32(): number;
  float(opts?: Partial<BoundedOptions>): number;
  integer(opts?: Partial<BoundedOptions>): number;
  dice(sides: number): number;
  unitVector<N extends number>(n: N): Vec<N>;
  /**
   * Choose a random value from a collection of `T`.
   *
   * @param options an {@link Array} or {@link Set} of `T`
   */
  sample<T>(options: T[] | Set<T>): T | undefined;
  /**
   * Remove and return a random value from a collection of `T`.
   *
   * @param options an {@link Array} or {@link Set} of `T`
   */
  take<T>(options: T[] | Set<T>): T | undefined;
  /**
   * Shuffles a provided array in-place to a new, random permutation using the
   * Fisher-Yates algorithm.
   *
   * @param array an array of values
   */
  permute<T>(array: T[]): void;
  /**
   * Shuffles a provided array and returns the random permutation as a new
   * array using the Fisher-Yates algorithm.
   *
   * @param array array an array of values
   */
  permutation<T>(array: T[]): T[];
  /**
   * Compute the number of unique permutations of a collection.
   *
   * @param set an {@link Array} or {@link Set}, or number representing its size
   */
  permutationsOf(set: number | Array<unknown> | Set<unknown>): number;
  /**
   * Shuffles a provided array in-place to a new, random derangement with no
   * fixed points, per the algorithm described by Martínez, Conrado,
   * Alois Panholzer, and Helmut Prodinger:
   * https://epubs.siam.org/doi/pdf/10.1137/1.9781611972986.7
   *
   * @param array an array of values
   */
  derange<T>(array: T[]): void;
  /**
   * Shuffles a provided array and returns a new, random derangement with no
   * fixed points, per the algorithm described by Martínez, Conrado,
   * Alois Panholzer, and Helmut Prodinger:
   * https://epubs.siam.org/doi/pdf/10.1137/1.9781611972986.7
   *
   * @param array an array of values
   */
  derangement<T>(array: T[]): T[];
  /**
   * Compute the number of unique derangements of a collection.
   *
   * @param set an {@link Array} or {@link Set}, or number representing its size
   */
  derangementsOf(set: number | Array<unknown> | Set<unknown>): number;
}

export class GenericPRNG implements PRNG {
  private _gen: () => number;

  constructor(gen: () => number = Math.random) {
    this._gen = gen;
  }

  bool() {
    return this._gen() >= 0.5;
  }

  natural(max: number = U32_MAX - 1) {
    assertNatural(max);
    return Math.floor(lerp(0, max + 1, this._gen()));
  }

  counting(max: number = U32_MAX - 1) {
    assertCounting(max);
    return Math.floor(lerp(1, max + 1, this._gen()));
  }

  u8() {
    return Math.floor(lerp(0, U8_MAX + 1, this._gen()));
  }

  u16() {
    return Math.floor(lerp(0, U16_MAX + 1, this._gen()));
  }

  u32() {
    return Math.floor(lerp(0, U32_MAX + 1, this._gen()));
  }

  i8() {
    return this.u8() + I8_MIN;
  }

  i16() {
    return this.u16() + I16_MIN;
  }

  i32() {
    return this.u32() + I32_MIN;
  }

  integer(
    { min = 0, max = U32_MAX }: Partial<BoundedOptions> = {
      max: U32_MAX,
    }
  ) {
    assertInteger(min, max);
    assertValidRange(min, max);
    return Math.floor(lerp(min, max + 1, this._gen()));
  }

  float({ min, max }: Partial<BoundedOptions> = {}) {
    if ((min === undefined && max === undefined) || (min === 0 && max === 1)) {
      return this._gen();
    }

    const mn = min ?? 0,
      mx = max ?? I32_MAX;
    assertValidRange(mn, mx);
    return lerp(mn, mx, this._gen());
  }

  dice(sides: number) {
    return this.integer({ min: 1, max: sides });
  }

  unitVector<N extends number>(n: N = 2 as N): Vec<N> {
    assertCounting(n);
    const phi = this._gen() * 2 * Math.PI;

    if (n === 1) return [1] as Vec<N>;
    if (n === 2) {
      return [Math.cos(phi), Math.sin(phi)] as Vec<N>;
    }
    if (n === 3) {
      const theta = Math.acos(1 - 2 * this._gen());
      return [
        Math.cos(phi) * Math.sin(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(theta),
      ] as Vec<N>;
    }

    const r = Array(n)
      .fill(null)
      .map(() => this.float({ min: -1, max: 1 }));
    const mag = Math.sqrt(r.reduce((acc, curr) => acc + curr ** 2, 0));
    return r.map((v) => v / mag) as Vec<N>;
  }

  sample<T>(options: T[] | Set<T>): T | undefined {
    const flat = options instanceof Set ? [...options] : options;
    if (flat.length === 0) return;

    const index = this.natural(flat.length - 1);
    return flat[index];
  }

  take<T>(options: T[] | Set<T>): T | undefined {
    const flat = options instanceof Set ? [...options] : options;
    if (flat.length === 0) return;

    const index = this.natural(flat.length - 1);
    const it = flat[index];

    if (options instanceof Set) {
      options.delete(it);
    } else {
      options.splice(index, 1);
    }

    return it;
  }

  /**
   * Shuffles a provided array in-place to a new, random permutation using the
   * Fisher-Yates algorithm.
   *
   * @param array an array of values
   */
  permute<T>(array: T[]) {
    for (let i = 0; i < array.length - 1; i++) {
      const j = i + this.integer({ max: array.length - i - 1 });
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  /**
   * Shuffles a provided array and returns the random permutation as a new
   * array using the Fisher-Yates algorithm.
   *
   * @param array array an array of values
   */
  permutation<T>(array: T[]): T[] {
    const p = [...array];
    for (let i = 0; i <= array.length - 1; i++) {
      const j = i + this.integer({ max: array.length - i - 1 });
      const temp = p[i];
      p[i] = p[j];
      p[j] = temp;
    }

    return p;
  }

  permutationsOf(set: number | Array<unknown> | Set<unknown>) {
    let n =
      set instanceof Set ? set.size : Array.isArray(set) ? set.length : set;
    if (n === 0) return 1;
    return factorial(n);
  }

  /**
   * Shuffles a provided array in-place to a new, random derangement with no
   * fixed points, per the algorithm described by Martínez, Conrado,
   * Alois Panholzer, and Helmut Prodinger:
   * https://epubs.siam.org/doi/pdf/10.1137/1.9781611972986.7
   *
   * @param array an array of values
   */
  derange<T>(array: T[]) {
    const mark = new Array<boolean>(array.length).fill(false);

    let i = array.length;
    let u = i;

    while (u >= 2) {
      if (!mark[i - 1]) {
        let j = 0;
        do {
          j = this.integer({ min: 1, max: i - 1 });
        } while (mark[j - 1]);

        const temp = array[j - 1];
        array[j - 1] = array[i - 1];
        array[i - 1] = temp;

        const pivot = this._gen();
        if (
          pivot <
          ((u - 1) * this.derangementsOf(u - 2)) / this.derangementsOf(u)
        ) {
          mark[j - 1] = true;
          u--;
        }
        u--;
      }
      i--;
    }
  }

  /**
   * Shuffles a provided array and returns a new, random derangement with no
   * fixed points, per the algorithm described by Martínez, Conrado,
   * Alois Panholzer, and Helmut Prodinger:
   * https://epubs.siam.org/doi/pdf/10.1137/1.9781611972986.7
   *
   * @param array an array of values
   */
  derangement<T>(array: T[]): T[] {
    const p = [...array];
    this.derange(p);
    return p;
  }

  derangementsOf(set: number | Array<unknown> | Set<unknown>) {
    let n =
      set instanceof Set ? set.size : Array.isArray(set) ? set.length : set;
    return Math.floor((factorial(n) + 1) / Math.E);
  }
}

class Mulberry32 extends GenericPRNG {
  private _seed: number;
  constructor(seed: number) {
    super(() => {
      this._seed |= 0;
      this._seed = (this._seed + 0x6d2b79f5) | 0;
      let t = Math.imul(this._seed ^ (this._seed >>> 15), 1 | this._seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
    });
    this._seed = seed;
  }
}

class SFC32 extends GenericPRNG {
  private _a: number;
  private _b: number;
  private _c: number;
  private _d: number;
  constructor(a: number, b: number, c: number, d: number) {
    super(() => {
      this._a |= 0;
      this._b |= 0;
      this._c |= 0;
      this._d |= 0;
      const t = (((this._a + this._b) | 0) + this._d) | 0;
      this._d = (this._d + 1) | 0;
      this._a = this._b ^ (this._b >>> 9);
      this._b = (this._c + (this._c << 3)) | 0;
      this._c = (this._c << 21) | (this._c >>> 11);
      this._c = (this._c + t) | 0;
      return (t >>> 0) / 0x100000000;
    });
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
  }
}

class SplitMix32 extends GenericPRNG {
  private _seed: number;
  constructor(seed: number) {
    super(() => {
      this._seed |= 0;
      this._seed = (this._seed + 0x9e3779b9) | 0;
      let t = this._seed ^ (this._seed >>> 16);
      t = Math.imul(t, 0x21f0aaad);
      t = t ^ (t >>> 15);
      t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ (t >>> 15)) >>> 0) / 0x100000000;
    });
    this._seed = seed;
  }
}

class JSF32B extends GenericPRNG {
  private _a: number;
  private _b: number;
  private _c: number;
  private _d: number;
  constructor(a: number, b: number, c: number, d: number) {
    super(() => {
      this._a |= 0;
      this._b |= 0;
      this._c |= 0;
      this._d |= 0;
      let t = (this._a - ((this._b << 27) | (this._b >>> 5))) | 0;
      this._a = this._b ^ ((this._c << 17) | (c >>> 15));
      this._b = (this._c + this._d) | 0;
      this._c = (this._d + t) | 0;
      this._d = (this._a + t) | 0;
      return (this._d >>> 0) / 0x100000000;
    });
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
  }
}

class GJRand32 extends GenericPRNG {
  private _a: number;
  private _b: number;
  private _c: number;
  private _d: number;
  constructor(a: number, b: number, c: number, d: number) {
    super(() => {
      this._a |= 0;
      this._b |= 0;
      this._c |= 0;
      this._d |= 0;
      this._a = (this._a << 16) | (this._a >>> 16);
      this._b = (this._b + this._c) | 0;
      this._a = (this._a + this._b) | 0;
      this._c = this._c ^ this._b;
      this._c = (this._c << 11) | (this._c >>> 21);
      this._b = this._b ^ this._a;
      this._a = (this._a + this._c) | 0;
      this._b = (this._c << 19) | (this._c >>> 13);
      this._c = (this._c + this._a) | 0;
      this._d = (this._d + 0x96a5) | 0;
      this._b = (this._b + this._d) | 0;
      return (this._a >>> 0) / 0x100000000;
    });
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
  }
}

export class Random {
  private static _prng = new GenericPRNG(Math.random);

  constructor(..._: never) {
    throw new Error(
      "Random contains static methods only and is not meant to be constructed"
    );
  }

  static Seedable = Mulberry32;
  static SFC32 = SFC32;
  static JSF32B = JSF32B;
  static SplitMix32 = SplitMix32;
  static Mulberry32 = Mulberry32;
  static GJRand32 = GJRand32;

  static bool() {
    return Random._prng.bool();
  }

  static natural(max: number = U32_MAX) {
    return Random._prng.natural(max);
  }

  static counting(max: number = U32_MAX) {
    return Random._prng.counting(max);
  }

  static u8() {
    return Random._prng.u8();
  }

  static u16() {
    return Random._prng.u16();
  }

  static u32() {
    return Random._prng.u32();
  }

  static i8() {
    return Random._prng.i8();
  }

  static i16() {
    return Random._prng.i16();
  }

  static i32() {
    return Random._prng.i32();
  }

  static integer(opts?: Partial<BoundedOptions>) {
    return Random._prng.integer(opts);
  }

  static float(opts?: Partial<BoundedOptions>) {
    return Random._prng.float(opts);
  }

  static dice(sides: number) {
    return Random._prng.dice(sides);
  }

  static unitVector<N extends number = 2>(n: N = 2 as N): Vec<N> {
    return Random._prng.unitVector<N>(n);
  }

  static sample<T>(options: T[] | Set<T>): T | undefined {
    return Random._prng.sample(options);
  }

  static take<T>(options: T[] | Set<T>): T | undefined {
    return Random._prng.take(options);
  }

  /**
   * Shuffles a provided array in-place to a new, random permutation using the
   * Fisher-Yates algorithm.
   *
   * @param array an array of values
   */
  static permute<T>(array: T[]) {
    return Random._prng.permute(array);
  }

  /**
   * Shuffles a provided array and returns the random permutation as a new
   * array using the Fisher-Yates algorithm.
   *
   * @param array array an array of values
   */
  static permutation<T>(array: T[]): T[] {
    return Random._prng.permutation(array);
  }

  /**
   * Compute the number of unique permutations of a collection.
   *
   * @param set an {@link Array} or {@link Set}, or number representing its size
   */
  static permutationsOf(set: number | Array<unknown> | Set<unknown>) {
    return Random._prng.permutationsOf(set);
  }

  /**
   * Shuffles a provided array in-place to a new, random derangement with no
   * fixed points, per the algorithm described by Martínez, Conrado,
   * Alois Panholzer, and Helmut Prodinger:
   * https://epubs.siam.org/doi/pdf/10.1137/1.9781611972986.7
   *
   * @param array an array of values
   */
  static derange<T>(array: T[]) {
    return Random._prng.derange(array);
  }

  /**
   * Shuffles a provided array and returns a new, random derangement with no
   * fixed points, per the algorithm described by Martínez, Conrado,
   * Alois Panholzer, and Helmut Prodinger:
   * https://epubs.siam.org/doi/pdf/10.1137/1.9781611972986.7
   *
   * @param array an array of values
   */
  static derangement<T>(array: T[]): T[] {
    return Random._prng.derangement(array);
  }

  /**
   * Compute the number of unique derangements of a collection.
   *
   * @param set an {@link Array} or {@link Set}, or number representing its size
   */
  static derangementsOf(set: number | Array<unknown> | Set<unknown>) {
    return Random._prng.derangementsOf(set);
  }
}
