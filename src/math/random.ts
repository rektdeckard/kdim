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
import { factorial, lerp } from "./transforms";
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

class GenericPRNG implements PRNG {
  #gen: () => number;

  constructor(gen: () => number) {
    this.#gen = gen;
  }

  bool() {
    return this.#gen() >= 0.5;
  }

  natural(max: number = U32_MAX - 1) {
    assertNatural(max);
    return Math.floor(lerp(0, max + 1, this.#gen()));
  }

  counting(max: number = U32_MAX - 1) {
    assertCounting(max);
    return Math.floor(lerp(1, max + 1, this.#gen()));
  }

  u8() {
    return Math.floor(lerp(0, U8_MAX + 1, this.#gen()));
  }

  u16() {
    return Math.floor(lerp(0, U16_MAX + 1, this.#gen()));
  }

  u32() {
    return Math.floor(lerp(0, U32_MAX, this.#gen()));
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
    { min = 0, max = U32_MAX - 1 }: Partial<BoundedOptions> = {
      max: U32_MAX - 1,
    }
  ) {
    assertInteger(min, max);
    assertValidRange(min, max);
    return Math.floor(lerp(min, max + 1, this.#gen()));
  }

  float({ min, max }: Partial<BoundedOptions> = {}) {
    if (min === undefined && max === undefined) {
      return this.#gen();
    }

    const mn = min ?? 0,
      mx = max ?? I32_MAX;
    assertValidRange(mn, mx);
    return lerp(mn, mx + 1, this.#gen());
  }

  dice(sides: number) {
    return this.integer({ min: 1, max: sides });
  }

  unitVector<N extends number>(n: N = 2 as N): Vec<N> {
    assertCounting(n);
    const phi = this.#gen() * 2 * Math.PI;

    if (n === 1) return [1] as Vec<N>;
    if (n === 2) {
      return [Math.cos(phi), Math.sin(phi)] as Vec<N>;
    }
    if (n === 3) {
      const theta = Math.acos(1 - 2 * this.#gen());
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

        const pivot = this.#gen();
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
  #seed: number;
  constructor(seed: number) {
    super(() => {
      this.#seed |= 0;
      this.#seed = (this.#seed + 0x6d2b79f5) | 0;
      let t = Math.imul(this.#seed ^ (this.#seed >>> 15), 1 | this.#seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    });
    this.#seed = seed;
  }
}

class SFC32 extends GenericPRNG {
  #a: number;
  #b: number;
  #c: number;
  #d: number;
  constructor(a: number, b: number, c: number, d: number) {
    super(() => {
      this.#a |= 0;
      this.#b |= 0;
      this.#c |= 0;
      this.#d |= 0;
      const t = (((this.#a + this.#b) | 0) + this.#d) | 0;
      this.#d = (this.#d + 1) | 0;
      this.#a = this.#b ^ (this.#b >>> 9);
      this.#b = (this.#c + (this.#c << 3)) | 0;
      this.#c = (this.#c << 21) | (this.#c >>> 11);
      this.#c = (this.#c + t) | 0;
      return (t >>> 0) / 4294967296;
    });
    this.#a = a;
    this.#b = b;
    this.#c = c;
    this.#d = d;
  }
}

class SplitMix32 extends GenericPRNG {
  #seed: number;
  constructor(seed: number) {
    super(() => {
      this.#seed |= 0;
      this.#seed = (this.#seed + 0x9e3779b9) | 0;
      let t = this.#seed ^ (this.#seed >>> 16);
      t = Math.imul(t, 0x21f0aaad);
      t = t ^ (t >>> 15);
      t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
    });
    this.#seed = seed;
  }
}

class JSF32B extends GenericPRNG {
  #a: number;
  #b: number;
  #c: number;
  #d: number;
  constructor(a: number, b: number, c: number, d: number) {
    super(() => {
      this.#a |= 0;
      this.#b |= 0;
      this.#c |= 0;
      this.#d |= 0;
      let t = (this.#a - ((this.#b << 27) | (this.#b >>> 5))) | 0;
      this.#a = this.#b ^ ((this.#c << 17) | (c >>> 15));
      this.#b = (this.#c + this.#d) | 0;
      this.#c = (this.#d + t) | 0;
      this.#d = (this.#a + t) | 0;
      return (this.#d >>> 0) / 4294967296;
    });
    this.#a = a;
    this.#b = b;
    this.#c = c;
    this.#d = d;
  }
}

class GJRand32 extends GenericPRNG {
  #a: number;
  #b: number;
  #c: number;
  #d: number;
  constructor(a: number, b: number, c: number, d: number) {
    super(() => {
      this.#a |= 0;
      this.#b |= 0;
      this.#c |= 0;
      this.#d |= 0;
      this.#a = (this.#a << 16) | (this.#a >>> 16);
      this.#b = (this.#b + this.#c) | 0;
      this.#a = (this.#a + this.#b) | 0;
      this.#c = this.#c ^ this.#b;
      this.#c = (this.#c << 11) | (this.#c >>> 21);
      this.#b = this.#b ^ this.#a;
      this.#a = (this.#a + this.#c) | 0;
      this.#b = (this.#c << 19) | (this.#c >>> 13);
      this.#c = (this.#c + this.#a) | 0;
      this.#d = (this.#d + 0x96a5) | 0;
      this.#b = (this.#b + this.#d) | 0;
      return (this.#a >>> 0) / 4294967296;
    });
    this.#a = a;
    this.#b = b;
    this.#c = c;
    this.#d = d;
  }
}

export class Random {
  static #prng = new GenericPRNG(Math.random);

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
    return Random.#prng.bool();
  }

  static natural(max: number = U32_MAX) {
    return Random.#prng.natural(max);
  }

  static counting(max: number = U32_MAX) {
    return Random.#prng.counting(max);
  }

  static u8() {
    return Random.#prng.u8();
  }

  static u16() {
    return Random.#prng.u16();
  }

  static u32() {
    return Random.#prng.u32();
  }

  static i8() {
    return Random.#prng.i8();
  }

  static i16() {
    return Random.#prng.i16();
  }

  static i32() {
    return Random.#prng.i32();
  }

  static integer(opts?: Partial<BoundedOptions>) {
    return Random.#prng.integer(opts);
  }

  static float(opts?: Partial<BoundedOptions>) {
    return Random.#prng.float(opts);
  }

  static dice(sides: number) {
    return Random.#prng.dice(sides);
  }

  static unitVector<N extends number = 2>(n: N = 2 as N): Vec<N> {
    return Random.#prng.unitVector<N>(n);
  }

  static sample<T>(options: T[] | Set<T>): T | undefined {
    return Random.#prng.sample(options);
  }

  static take<T>(options: T[] | Set<T>): T | undefined {
    return Random.#prng.take(options);
  }

  /**
   * Shuffles a provided array in-place to a new, random permutation using the
   * Fisher-Yates algorithm.
   *
   * @param array an array of values
   */
  static permute<T>(array: T[]) {
    return Random.#prng.permute(array);
  }

  /**
   * Shuffles a provided array and returns the random permutation as a new
   * array using the Fisher-Yates algorithm.
   *
   * @param array array an array of values
   */
  static permutation<T>(array: T[]): T[] {
    return Random.#prng.permutation(array);
  }

  /**
   * Compute the number of unique permutations of a collection.
   *
   * @param set an {@link Array} or {@link Set}, or number representing its size
   */
  static permutationsOf(set: number | Array<unknown> | Set<unknown>) {
    return Random.#prng.permutationsOf(set);
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
    return Random.#prng.derange(array);
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
    return Random.#prng.derangement(array);
  }

  /**
   * Compute the number of unique derangements of a collection.
   *
   * @param set an {@link Array} or {@link Set}, or number representing its size
   */
  static derangementsOf(set: number | Array<unknown> | Set<unknown>) {
    return Random.#prng.derangementsOf(set);
  }
}
