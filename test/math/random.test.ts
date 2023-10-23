import { describe, it, expect } from "vitest";
import {
  Random,
  Range,
  factorial,
  U8_MAX,
  U16_MAX,
  U32_MAX,
  I8_MAX,
  I8_MIN,
  I16_MAX,
  I16_MIN,
  I32_MAX,
  I32_MIN,
} from "../../src/math";

describe("Random", () => {
  describe("bool", () => {
    it("returns a boolean", () => {
      expect(typeof Random.bool()).toBe("boolean");
    });

    it("produces a sensible distribution", () => {
      const runs = 10000;
      const results = Range.of({ from: 1, to: runs }, Random.bool);
      const distro = results.reduce(
        (acc, curr) => {
          acc[curr.toString()] += 1;
          return acc;
        },
        { true: 0, false: 0 }
      );

      expect(distro.true / runs).toBeCloseTo(0.5, 1);
      expect(distro.false / runs).toBeCloseTo(0.5, 1);
    });
  });

  describe("natural", () => {
    it("returns a natural number", () => {
      const nats = Range.of(100, Random.natural);
      expect(nats.every(Number.isInteger)).toBe(true);
      expect(nats.every((n) => n >= 0)).toBe(true);
    });

    it("is constrained to max value", () => {
      const nats = Range.of(100, () => Random.natural(5));
      expect(nats.some((n) => n === 0)).toBe(true);
      expect(nats.some((n) => n === 5)).toBe(true);
    });
  });

  describe("counting", () => {
    it("returns a counting number", () => {
      const counts = Range.of(100, () => Random.counting());
      expect(counts.every(Number.isInteger)).toBe(true);
      expect(counts.every((n) => n > 0)).toBe(true);
    });

    it("is constrained to max value", () => {
      const counts = Range.of(100, () => Random.counting(5));
      expect(counts.some((n) => n === 0)).toBe(false);
      expect(counts.some((n) => n === 5)).toBe(true);
    });
  });

  describe("u8", () => {
    it("returns a u8", () => {
      const u8 = Random.u8();
      expect(u8).toBeGreaterThanOrEqual(0);
      expect(u8).toBeLessThanOrEqual(U8_MAX);
    });
  });

  describe("u16", () => {
    it("returns a u16", () => {
      const u16 = Random.u16();
      expect(u16).toBeGreaterThanOrEqual(0);
      expect(u16).toBeLessThanOrEqual(U16_MAX);
    });
  });

  describe("u32", () => {
    it("returns a u32", () => {
      const u32 = Random.u32();
      expect(u32).toBeGreaterThanOrEqual(0);
      expect(u32).toBeLessThanOrEqual(U32_MAX);
    });
  });

  describe("i8", () => {
    it("returns an i8", () => {
      const i8 = Random.i8();
      expect(i8).toBeGreaterThanOrEqual(I8_MIN);
      expect(i8).toBeLessThanOrEqual(I8_MAX);
    });
  });

  describe("i16", () => {
    it("returns an i16", () => {
      const i16 = Random.i16();
      expect(i16).toBeGreaterThanOrEqual(I16_MIN);
      expect(i16).toBeLessThanOrEqual(I16_MAX);
    });
  });

  describe("i32", () => {
    it("returns an i32", () => {
      const i32 = Random.i32();
      expect(i32).toBeGreaterThanOrEqual(I32_MIN);
      expect(i32).toBeLessThanOrEqual(I32_MAX);
    });
  });

  describe("integer", () => {
    it("returns a integer", () => {
      const i = Random.integer();
      expect(Number.isInteger(i)).toBe(true);
    });

    it("can be constrained to a range", () => {
      const min = 6023;
      const max = 7089;
      const i = Random.integer({ min, max });
      expect(i).toBeGreaterThanOrEqual(min);
      expect(i).toBeLessThanOrEqual(max);
    });
  });

  describe("float", () => {
    it("returns a float", () => {
      const f = Random.float();
      expect(Number.isInteger(f)).toBe(false);
    });

    it("can be constrained to a range", () => {
      const min = -1234123.45;
      const max = 389938;
      const f = Random.float({ min, max });
      expect(f).toBeGreaterThanOrEqual(min);
      expect(f).toBeLessThanOrEqual(max);
    });
  });

  describe("dice", () => {
    it("works with common sizes", () => {
      {
        const d = 6;
        expect(Random.dice(d)).toBeGreaterThanOrEqual(1);
        expect(Random.dice(d)).toBeLessThanOrEqual(d);
      }
      {
        const d = 8;
        expect(Random.dice(d)).toBeGreaterThanOrEqual(1);
        expect(Random.dice(d)).toBeLessThanOrEqual(d);
      }
      {
        const d = 10;
        expect(Random.dice(d)).toBeGreaterThanOrEqual(1);
        expect(Random.dice(d)).toBeLessThanOrEqual(d);
      }
      {
        const d = 12;
        expect(Random.dice(d)).toBeGreaterThanOrEqual(1);
        expect(Random.dice(d)).toBeLessThanOrEqual(d);
      }
      {
        const d = 20;
        expect(Random.dice(d)).toBeGreaterThanOrEqual(1);
        expect(Random.dice(d)).toBeLessThanOrEqual(d);
      }
    });

    it("throws with illigal values", () => {
      expect(() => Random.dice(-1)).toThrowError();
      expect(() => Random.dice(5.75)).toThrowError();
      expect(() => Random.dice(0)).toThrowError();
    });

    it("produces a sensible distribution", () => {
      const runs = 10000;
      const results = Range.of({ from: 1, to: runs }, () => Random.dice(6));
      const distro = results.reduce(
        (acc, curr) => {
          acc[curr] += 1;
          return acc;
        },
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      );

      expect(distro["1"] / runs).toBeCloseTo(1 / 6, 1);
      expect(distro["2"] / runs).toBeCloseTo(1 / 6, 1);
      expect(distro["3"] / runs).toBeCloseTo(1 / 6, 1);
      expect(distro["4"] / runs).toBeCloseTo(1 / 6, 1);
      expect(distro["5"] / runs).toBeCloseTo(1 / 6, 1);
      expect(distro["6"] / runs).toBeCloseTo(1 / 6, 1);
    });
  });

  describe("unitVector", () => {
    it("returns a unit vector", () => {
      const v = Random.unitVector();
      expect(v.x ** 2 + v.y ** 2).toBeCloseTo(1, 5);
    });
  });

  describe("sample", () => {
    it("selects an element from an array", () => {
      const items = ["green", "eggs", "and", "ham"];
      const selection = Random.sample(items)!;
      expect(items.includes(selection)).toBe(true);
    });

    it("selects an element from a set", () => {
      const items = new Set(["green", "eggs", "and", "ham"]);
      const selection = Random.sample(items)!;
      expect(items.has(selection)).toBe(true);
    });
  });

  describe("take", () => {
    it("takes an element from an array", () => {
      const colors = ["red", "orange", "yellow", "green", "blue", "violet"];
      const it = Random.take(colors);
      expect(it).toBeDefined();
      expect(colors).not.toContain(it);
    });

    it("takes an element from a set", () => {
      const colors = new Set([
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "violet",
      ]);
      const it = Random.take(colors);
      expect(it).toBeDefined();
      expect(colors).not.toContain(it);
    });

    it("returns undefined when empty", () => {
      const nums = [7, 42];
      const numset = new Set(nums);

      Random.take(nums);
      expect(Random.take(nums)).toBeDefined();
      expect(Random.take(nums)).toBeUndefined();

      Random.take(numset);
      expect(Random.take(numset)).toBeDefined();
      expect(Random.take(numset)).toBeUndefined();
    });
  });

  describe("permute", () => {
    it("permutes an array in-place", () => {
      const items = ["green", "eggs", "and", "ham"];
      const clone = [...items];
      Random.permute(clone);
      expect(clone.length).toBe(items.length);
      expect(items.every((e) => clone.includes(e))).toBe(true);
    });
  });

  describe("permutation", () => {
    it("returns a new permutation", () => {
      const digits = Range.of(9);
      const p = Random.permutation(digits);
      expect(p.length).toBe(digits.length);
      expect(digits.every((e) => p.includes(e))).toBe(true);
    });
  });

  describe("permutationsOf", () => {
    it("is accurate", () => {
      expect(Random.permutationsOf(3)).toBe(factorial(3));
      expect(
        Random.permutationsOf(["harder", "better", "faster", "stronger"])
      ).toBe(24);
      expect(Random.permutationsOf(10)).toBe(factorial(10));
    });
  });

  describe("derange", () => {
    it("deranges an array in-place", () => {
      const arr = [1, 3, 6, 30];
      const der = [...arr];
      Random.derange(der);
      expect(der.length).toBe(arr.length);
      expect(arr.every((el) => der.includes(el))).toBe(true);
      expect(der).not.toStrictEqual(arr);
    });
  });

  describe("derangement", () => {
    it("produces a valid derangement of an array", () => {
      const arr = [1, 3, 6, 30];
      const der = Random.derangement(arr);
      expect(der.length).toBe(arr.length);
      expect(arr.every((el) => der.includes(el))).toBe(true);
      expect(der).not.toStrictEqual(arr);
    });

    it("produces a valid derangement of a large array", () => {
      const arr = Range.of(40);
      const der = Random.derangement(arr);
      expect(der.length).toBe(arr.length);
      expect(arr.every((el) => der.includes(el))).toBe(true);
      expect(der).not.toStrictEqual(arr);
    });
  });

  describe("derangementsOf", () => {
    it("is accurate", () => {
      expect(Random.derangementsOf(3)).toBe(2);
      expect(Random.derangementsOf(4)).toBe(9);
      expect(Random.derangementsOf(10)).toBe(1334961);
    });

    it("works with sets and arrays", () => {
      let a = ["harder", "better", "faster", "stronger"];
      let s = new Set(a);
      expect(Random.derangementsOf(a)).toBe(9);
      expect(Random.derangementsOf(s)).toBe(9);
    });
  });
});
