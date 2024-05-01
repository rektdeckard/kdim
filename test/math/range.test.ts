import { describe, it, expect } from "vitest";
import { Range, Complex, Random } from "../../src";

describe("Range", () => {
  describe("simple range", () => {
    it("constructs a simple range", () => {
      const r = Range.of(5);
      expect(r).toStrictEqual([0, 1, 2, 3, 4]);
    });

    it("constructs a simple descending range", () => {
      const r = Range.of(-4);
      expect(r).toStrictEqual([0, -1, -2, -3]);
    });

    it("constructs a range from starting point", () => {
      const r = Range.of<number>({ from: 9, to: 13 });
      expect(r).toStrictEqual([9, 10, 11, 12, 13]);
    });

    it("constructs a descending range", () => {
      const r = Range.of({ from: 69, to: 60 });
      expect(r).toStrictEqual([69, 68, 67, 66, 65, 64, 63, 62, 61, 60]);
    });

    it("constructs a simple range with steps", () => {
      const r = Range.of({ to: 9, step: 3 });
      expect(r).toStrictEqual([0, 3, 6, 9]);
    });

    it("constructs a descending range with steps", () => {
      const r = Range.of<number>({ from: 25, to: 10, step: 2.5 });
      expect(r).toStrictEqual([25, 22.5, 20, 17.5, 15, 12.5, 10]);
    });

    it("throws with a negative step", () => {
      expect(() => Range.of({ from: 5, to: 1, step: -1 })).toThrowError(
        "Step size must be positive, as its sign is inferred from the range"
      );
    });

    it.skip("throws when attempting to construct", () => {
      // @ts-ignore
      expect(() => new Range(5)).toThrowError(
        "Range contains static methods only and is not meant to be constructed"
      );
    });
  });

  describe("range object", () => {
    it("constructs a Range", () => {
      const ra = new Range(5);
      expect([...ra]).toStrictEqual([0, 1, 2, 3, 4]);

      const rb = new Range({ from: 5, to: 9 });
      expect([...rb]).toStrictEqual([5, 6, 7, 8, 9]);
      expect(Array.from(rb)).toStrictEqual([5, 6, 7, 8, 9]);
    });

    it("compares ranges", () => {
      const fingers = new Range({ from: 1, to: 10 });
      expect(fingers.contains(5)).toBe(true);
      expect(fingers.contains(11)).toBe(false);
      expect(fingers.contains(-1)).toBe(false);
      expect(fingers.contains(new Range({ from: 2, to: 7 }))).toBe(true);
      expect(fingers.contains(new Range({ from: 7, to: 2 }))).toBe(true);
      expect(fingers.contains(new Range({ from: 7, to: 11 }))).toBe(false);
      expect(fingers.contains(new Range({ from: 7, to: -1 }))).toBe(false);
      expect(fingers.contains(new Range({ from: -1, to: 10 }))).toBe(false);
    });
  });

  describe("complex constructor", () => {
    it("constructs a range of Complex numberss", () => {
      const r = Range.of(3, Complex);

      expect(r[1].eq(new Complex(1, 1))).toBe(true);
      expect(r[2].eq(new Complex(2, 2))).toBe(true);
      expect(r.map(Number)).toStrictEqual([0, 1, 2]);
    });

    it("constructs a descending range of Complex numbers with steps", () => {
      const r = Range.of(
        { from: 25, to: 10, step: 2.5 },
        (n) => new Complex(n)
      );
      expect(r[1].eq(new Complex(22.5))).toBe(true);
      expect(r[4].eq(new Complex(15))).toBe(true);
      expect(r.map(Number)).toStrictEqual([25, 22.5, 20, 17.5, 15, 12.5, 10]);
    });
  });

  describe("functional constructor", () => {
    it("constructs a range of objects", () => {
      const r = Range.of(3, (n) => ({ n }));
      expect(r).toStrictEqual([{ n: 0 }, { n: 1 }, { n: 2 }]);
    });

    it("constructs a descending range of objects with steps", () => {
      const r = Range.of({ from: 25, to: 10, step: 2.5 }, (n, i) => ({ n, i }));
      expect(r).toStrictEqual([
        { i: 0, n: 25 },
        { i: 1, n: 22.5 },
        { i: 2, n: 20 },
        { i: 3, n: 17.5 },
        { i: 4, n: 15 },
        { i: 5, n: 12.5 },
        { i: 6, n: 10 },
      ]);
    });

    it("can use a function reference", () => {
      const bools = Range.of(5, Random.bool);
      expect(bools.length).toBe(5);
      expect(bools.every((b) => typeof b === "boolean")).toBe(true);

      const rng = new Random.Seedable(69);
      const sbools = Range.of(5, rng.bool.bind(rng));
      expect(sbools).toStrictEqual([true, false, true, true, true]);
    });

    it("can generate other things", () => {
      const randBools = Range.of(10, () => Math.random() >= 0.5);
      expect(randBools.every((b) => typeof b === "boolean")).toBe(true);
    });
  });

  describe("lazy", () => {
    it("can iterate lazily", () => {
      let x = 0;
      for (const i of Range.lazy(Infinity)) {
        if (i >= 100) break;
        x = i;
      }

      expect(x).toBe(99);
    });

    it("can reverse iterate lazily", () => {
      let x = 0;
      for (const i of Range.lazy(-Infinity)) {
        if (i <= -100) break;
        x = i;
      }

      expect(x).toBe(-99);
    });

    it("can be used as a generator object", () => {
      const gen = Range.lazy({ from: 1, to: 7 });
      expect([...gen]).toStrictEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("can be used as an iterable", () => {
      const gen = Range.lazy({ from: 7, to: 1 });
      expect([...gen]).toStrictEqual([1, 2, 3, 4, 5, 6, 7].reverse());
    });

    it("can be used as an iterator", () => {
      const gen = Range.lazy({ from: 1, to: 7 });
      expect(gen.next().value).toBe(1);
      expect(gen.next().value).toBe(2);
      expect(gen.next().value).toBe(3);
      expect(gen.next().value).toBe(4);
      expect([...gen]).toStrictEqual([5, 6, 7]);
      expect(gen.next().done).toBe(true);
    });

    it("can use a complex constructor", () => {
      const gen = Range.lazy(5, (n) => new Complex(n));
      expect([...gen].every((c, i) => c.eq(i))).toBe(true);
    });
  });
});
