import { describe, it, expect } from "vitest";
import { Saturating } from "../../src";

describe("Saturating", () => {
  describe("new Saturating()", () => {
    it("can be constructed", () => {
      const u8 = new Saturating({ max: 7 });
      expect(u8.value).toBe(0);
      expect(u8.min).toBe(0);
      expect(u8.max).toBe(7);
    });

    it("can be constructed with numeric initial value", () => {
      const u16 = new Saturating({ max: 0xffff }, 0xabcd);
      expect(u16.value).toBe(0xabcd);
      expect(u16.min).toBe(0);
      expect(u16.max).toBe(0xffff);
    });

    it("can be constructed with custom range", () => {
      const i8 = new Saturating({ min: -(2 ** 7), max: 2 ** 7 - 1 }, 0);
      expect(i8.value).toBe(0);
      expect(i8.min).toBe(-128);
      expect(i8.max).toBe(127);
    });

    it("can be constructed using the from() factory", () => {
      const first = new Saturating({ min: -5, max: 5 }, 0);
      const second = Saturating.from(first);
      expect(first.value).toBe(second.value);
      expect(first.min).toBe(second.min);
      expect(first.max).toBe(second.max);
    });

    it("throws with non-integer range", () => {
      expect(() => new Saturating({ max: 4.2 })).toThrow(RangeError);
      expect(() => new Saturating({ min: 2, max: 10 }, 3.5)).toThrow(
        RangeError
      );
    });

    it("throws with invalid range", () => {
      expect(() => new Saturating({ min: 10, max: 0 })).toThrow(RangeError);
    });
  });

  describe("Saturating.add()", () => {
    it("performs non-saturating addition", () => {
      const u8 = new Saturating({ max: 7 }, 3);
      expect(u8.add(1).value).toBe(4);
    });

    it("performs saturating addition", () => {
      const u8 = new Saturating({ max: 7 }, 4);
      expect(u8.add(5).value).toBe(7);
    });

    it("performs non-saturating addition with negative addend", () => {
      const u8 = new Saturating({ max: 7 }, 2);
      expect(u8.add(-1).value).toBe(1);
    });

    it("performs saturating addition with negative addend", () => {
      const u8 = new Saturating({ max: 7 }, 1);
      expect(u8.add(-6).value).toBe(0);
    });

    it("performs saturating addition with custom range", () => {
      const i8 = new Saturating({ min: -(2 ** 7), max: 2 ** 7 - 1 }, 0);
      expect(i8.add(200).value).toBe(127);
    });

    it("performs addition with a Saturating addend", () => {
      const u8a = new Saturating({ max: 7 }, 3);
      const u8b = new Saturating({ max: 7 }, 2);
      expect(u8a.add(u8b).value).toBe(5);

      const u274 = new Saturating({ max: 273 }, 100);
      expect(u8a.add(u274).value).toBe(7);
      expect(u274.add(u8b).value).toBe(102);
    });

    it("throws with non-integer value", () => {
      expect(() => new Saturating({ max: 4 }).add(1.1)).toThrow(RangeError);
    });
  });

  describe("Saturating.sub()", () => {
    it("performs non-saturating subtraction", () => {
      const u8 = new Saturating({ max: 7 }, 3);
      expect(u8.sub(1).value).toBe(2);
    });

    it("performs saturating subtraction", () => {
      const u8 = new Saturating({ max: 7 }, 2);
      expect(u8.sub(5).value).toBe(0);
    });

    it("performs non-saturating subtraction with negative subtrahend", () => {
      const u8 = new Saturating({ max: 7 }, 4);
      expect(u8.sub(-1).value).toBe(5);
    });

    it("performs saturating subtraction with negative subtrahend", () => {
      const u8 = new Saturating({ max: 7 }, 5);
      expect(u8.sub(-6).value).toBe(7);
    });

    it("performs saturating subtraction with custom range", () => {
      const i8 = new Saturating({ min: -(2 ** 7), max: 2 ** 7 - 1 }, 0);
      expect(i8.sub(200).value).toBe(-128);
    });

    it("performs subtraction with a Saturating subtrahend", () => {
      const u8a = new Saturating({ max: 7 }, 6);
      const u8b = new Saturating({ max: 7 }, 2);
      expect(u8a.sub(u8b).value).toBe(4);

      const u274 = new Saturating({ max: 273 }, 100);
      expect(u8a.sub(u274).value).toBe(0);
      expect(u274.sub(u8b).value).toBe(98);
    });

    it("throws with non-integer value", () => {
      expect(() => new Saturating({ max: 4 }).sub(1.1)).toThrow(RangeError);
    });
  });

  describe("Saturating.mul()", () => {
    it("performs non-saturating multiplication", () => {
      const u8 = new Saturating({ max: 7 }, 3);
      expect(u8.mul(1).value).toBe(3);
      expect(u8.mul(2).value).toBe(6);
    });

    it("performs saturating multiplication", () => {
      const u8 = new Saturating({ max: 7 }, 2);
      expect(u8.mul(5).value).toBe(7);
    });

    it("performs saturating multiplication with negative multiplier", () => {
      const u8 = new Saturating({ max: 7 }, 5);
      expect(u8.mul(-6).value).toBe(0);
    });

    it("performs saturating multiplication with custom range", () => {
      const i8 = new Saturating({ min: -(2 ** 7), max: 2 ** 7 - 1 }, 1);
      expect(i8.mul(200).value).toBe(127);
    });

    it("performs multiplication with a Saturating multiplier", () => {
      const u8a = new Saturating({ max: 7 }, 3);
      const u8b = new Saturating({ max: 7 }, 2);
      expect(u8a.mul(u8b).value).toBe(6);

      const u274 = new Saturating({ max: 273 }, 100);
      expect(u8a.mul(u274).value).toBe(7);
      expect(u274.mul(u8b).value).toBe(200);
    });

    it("throws with non-integer value", () => {
      expect(() => new Saturating({ max: 4 }).mul(1.1)).toThrow(RangeError);
    });
  });

  describe("Saturating.div()", () => {
    it("performs non-saturating division", () => {
      const u8 = new Saturating({ max: 7 }, 6);
      expect(u8.div(2).value).toBe(3);
      expect(u8.div(4).value).toBe(1); // Truncating division
    });

    it("performs saturating division", () => {
      const u8 = new Saturating({ max: 7 }, 2);
      expect(u8.div(5).value).toBe(0);
    });

    it("performs saturating division with negative divisor", () => {
      const u8 = new Saturating({ max: 7 }, 5);
      expect(u8.div(-6).value).toBe(0);
    });

    it("performs saturating division with custom range", () => {
      const s = new Saturating({ min: -10, max: 0 }, -5);
      expect(s.div(-2).value).toBe(0);
    });

    it("performs division with a Saturating divisor", () => {
      const u8a = new Saturating({ max: 7 }, 6);
      const u8b = new Saturating({ max: 7 }, 3);
      expect(u8a.div(u8b).value).toBe(2);

      const u274 = new Saturating({ max: 273 }, 99);
      expect(u8a.div(u274).value).toBe(0);
      expect(u274.div(u8b).value).toBe(33);
    });

    it("throws on divide by zero", () => {
      const u8 = new Saturating({ max: 7 }, 5);
      expect(() => u8.div(0)).toThrow(Error);
    });

    it("throws with non-integer value", () => {
      expect(() => new Saturating({ max: 4 }).div(1.1)).toThrow(RangeError);
    });
  });
});
