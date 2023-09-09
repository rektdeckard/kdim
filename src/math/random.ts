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
} from "./constants";
import { factorial, lerp } from "./transforms";

export class Random {
  constructor(..._: never) {
    throw new Error(
      "Random contains static methods only and is not meant to be constructed"
    );
  }

  static bool() {
    return Math.random() >= 0.5;
  }

  static natural(max: number = U32_MAX) {
    assertNatural(max);
    return Math.floor(lerp(0, max + 1, Math.random()));
  }

  static counting(max: number = U32_MAX) {
    assertCounting(max);
    return Math.floor(lerp(1, max + 1, Math.random()));
  }

  static u8() {
    return Math.floor(lerp(0, U8_MAX + 1, Math.random()));
  }

  static u16() {
    return Math.floor(lerp(0, U16_MAX + 1, Math.random()));
  }

  static u32() {
    return Math.floor(lerp(0, U32_MAX + 1, Math.random()));
  }

  static i8() {
    return Random.u8() + I8_MIN;
  }

  static i16() {
    return Random.u16() + I16_MIN;
  }

  static i32() {
    return Random.u32() + I32_MIN;
  }

  static integer(
    { min = 0, max = U32_MAX }: { min?: number; max?: number } = {
      max: U32_MAX,
    }
  ) {
    assertInteger(min, max);
    assertValidRange(min, max);
    return Math.floor(lerp(min, max + 1, Math.random()));
  }

  static float(
    { min = 0, max = U32_MAX }: { min?: number; max?: number } = {
      max: U32_MAX,
    }
  ) {
    assertValidRange(min, max);
    return lerp(min, max + 1, Math.random());
  }

  static dice(sides: number) {
    assertCounting(sides);
    return Random.integer({ min: 1, max: sides });
  }

  static sample<T>(options: T[] | Set<T>): T | undefined {
    const flat = options instanceof Set ? [...options] : options;
    if (flat.length === 0) return;

    const index = Random.natural(flat.length - 1);
    return flat[index];
  }

  static take<T>(options: T[] | Set<T>): T | undefined {
    const flat = options instanceof Set ? [...options] : options;
    if (flat.length === 0) return;

    const index = Random.natural(flat.length - 1);
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
  static permute<T>(array: T[]) {
    for (let i = 0; i < array.length - 1; i++) {
      const j = i + Random.integer({ max: array.length - i - 1 });
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
  static permutation<T>(array: T[]): T[] {
    const p = new Array<T>(array.length);
    for (let i = 0; i <= array.length - 2; i++) {
      const j = i + Random.integer({ max: array.length - i - 1 });
      p[i] = array[j];
      p[j] = array[i];
    }

    return p;
  }

  static permutationsOf(set: number | Array<unknown> | Set<unknown>) {
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
  static derange<T>(array: T[]) {
    const mark = new Array<boolean>(array.length).fill(false);

    let i = array.length;
    let u = i;

    while (u >= 2) {
      if (!mark[i - 1]) {
        let j = 0;
        do {
          j = Random.integer({ min: 1, max: i - 1 });
        } while (mark[j - 1]);

        const temp = array[j - 1];
        array[j - 1] = array[i - 1];
        array[i - 1] = temp;

        const pivot = Math.random();
        if (
          pivot <
          ((u - 1) * Random.derangementsOf(u - 2)) / Random.derangementsOf(u)
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
  static derangement<T>(array: T[]): T[] {
    const p = [...array];
    Random.derange(p);
    return p;
  }

  static derangementsOf(set: number | Array<unknown> | Set<unknown>) {
    let n =
      set instanceof Set ? set.size : Array.isArray(set) ? set.length : set;
    return Math.floor((factorial(n) + 1) / Math.E);
  }
}
