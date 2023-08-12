import { describe, it, expect } from "vitest";
import { clamp, lerp, Range, ComplexNumber } from "../../src";

describe("clamp()", () => {
  it("clamps value in simple range", () => {
    const [min, max] = [20, 50];
    expect(clamp(min, max, 100)).toBe(50);
  });

  it("clamps value in range crossing zero", () => {
    const [min, max] = [-99, 99];
    expect(clamp(min, max, -1000)).toBe(-99);
  });

  it("leaves values in range as-is", () => {
    const [min, max] = [0, 1];
    const val = 0.234;
    expect(clamp(min, max, val)).toBe(val);
  });

  it("throws with invalid range", () => {
    const [min, max] = [1, 0];
    expect(() => clamp(min, max, 0.25)).toThrow(RangeError);
  });
});

describe("lerp()", () => {
  it("interpolates value in simple range", () => {
    const [min, max] = [20, 50];
    expect(lerp(min, max, 0.5)).toBe(35);
  });

  it("interpolates value in range crossing zero", () => {
    const [min, max] = [-99, 99];
    expect(lerp(min, max, 0.25)).toBe(-49.5);
  });

  it("interpolates value in nagative range", () => {
    const [min, max] = [100, 0];
    expect(lerp(min, max, 0.01)).toBe(99);
  });

  it("throws with value outside range", () => {
    const [min, max] = [0, 42];
    expect(() => lerp(min, max, -1)).toThrow(RangeError);
  });
});

describe("range", () => {
  describe("simple range", () => {
    it("constructs a simple range", () => {
      const r = Range.of(5);
      expect(r).toStrictEqual([0, 1, 2, 3, 4, 5]);
    });

    it("constructs a simple descending range", () => {
      const r = Range.of(-4);
      expect(r).toStrictEqual([0, -1, -2, -3, -4]);
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

    it("throws when attempting to construct", () => {
      // @ts-ignore
      expect(() => new Range(5)).toThrowError(
        "Range contains static methods only and is not meant to be constructed"
      );
    });
  });

  describe("complex constructor", () => {
    it("constructs a range of ComplexNumbers", () => {
      const r = Range.of(3, ComplexNumber);

      expect(r[1].eq(new ComplexNumber(1))).toBe(true);
      expect(r[2].eq(new ComplexNumber(2))).toBe(true);
      expect(r.map(Number)).toStrictEqual([0, 1, 2, 3]);
    });

    it("constructs a descending range of ComplexNumbers with steps", () => {
      const r = Range.of({ from: 25, to: 10, step: 2.5 }, ComplexNumber);
      expect(r[1].eq(new ComplexNumber(22.5))).toBe(true);
      expect(r[4].eq(new ComplexNumber(15))).toBe(true);
      expect(r.map(Number)).toStrictEqual([25, 22.5, 20, 17.5, 15, 12.5, 10]);
    });
  });

  describe("functional constructor", () => {
    it("constructs a range of objects", () => {
      const r = Range.of(3, (n) => ({ val: n }));
      expect(r).toStrictEqual([{ val: 0 }, { val: 1 }, { val: 2 }, { val: 3 }]);
    });

    it("constructs a descending range of objects with steps", () => {
      const r = Range.of({ from: 25, to: 10, step: 2.5 }, (n) => ({ val: n }));
      expect(r).toStrictEqual([
        { val: 25 },
        { val: 22.5 },
        { val: 20 },
        { val: 17.5 },
        { val: 15 },
        { val: 12.5 },
        { val: 10 },
      ]);
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
      const gen = Range.lazy(5, ComplexNumber);
      expect([...gen].every((c, i) => c.eq(i))).toBe(true);
    });
  });
});
